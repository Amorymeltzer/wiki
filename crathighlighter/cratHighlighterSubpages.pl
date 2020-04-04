#!/usr/bin/env perl
# cratHighlighterSubpages.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Make it easier to sync crathighlighter.js
# https://en.wikipedia.org/wiki/User:Amorymeltzer/crathighlighter.js

use strict;
use warnings;
use diagnostics;

use Getopt::Std;
use Config::General qw(ParseConfig);
use MediaWiki::API;
use Git::Repository;
use File::Slurper qw(write_text);
use File::Compare;
use JSON;
use Term::ANSIColor;

# Parse commandline options
my %opts = ();
getopts('hpc', \%opts);
if ($opts{h}) { usage(); exit; } # Usage

# Check repo before doing anything risky
my $repo = Git::Repository->new();
if ($repo->run('rev-parse' => '--abbrev-ref', 'HEAD') ne 'master') {
  print "Not on master branch, quitting\n";
  exit 0;
} elsif (scalar $repo->run(status => '--porcelain')) {
  print "Repository is not clean, quitting\n";
  exit;
}

# Config file should be a simple file consisting of username and botpassword
# username = Jimbo Wales
# password = stochasticstring
my %conf;
my $config_file = "$ENV{HOME}/.crathighlighterrc";
%conf = ParseConfig($config_file) if -e -f -r $config_file;

my $mw = MediaWiki::API->new({
			      api_url => 'https://en.wikipedia.org/w/api.php',
			      on_error => \&dieNice
			     });
$mw->{ua}->agent('cratHighlighterSubpages.pl ('.$mw->{ua}->agent.')');
$mw->login({lgname => $conf{username}, lgpassword => $conf{password}});

my ($localChange,$wikiChange) = (0,0);
my @rights = qw (bureaucrat oversight checkuser interface-admin arbcom steward);
foreach (@rights) {
  my @names;

  my $file = $_.'.json';
  my $wiki = $_.'.wiki';

  if (/arbcom/) {
    # Imperfect, relies upon the template being updated, but ArbCom membership
    # is high-profile enough that it will likely be updated quickly
    my $page = $mw->get_page({title => 'Template:Arbitration_committee_chart/recent'});
    my $content = $page->{q{*}};

    # Find the diamonds in the rough
    my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=gmtime;
    $year += 1900;
    # 0-padding
    $mon = sprintf '%02d', $mon+1;
    $mday = sprintf '%02d', $mday;
    my $now = $year.q{-}.$mon.q{-}.$mday;
    # For dumb template reasons, arbs are listed as ending terms on December
    # 30th.  While unlikely, this means the list won't be accurate on the
    # 31st, so just skip it.  Likewise, since we check that the date is
    # greater than the current date to ensure that we catch retiring arbs, the
    # 30th is no good as well.
    last if $now =~ /-12-3[0|1]/;
    for (split /^/, $content) {
      if (/from:(\d{2}\/\d{2}\/\d{4}) till:(\d{2}\/\d{2}\/\d{4}).*\[\[User:.*\|(.*)\]\]/) {
	my ($from,$till,$name) = ($1,$2,$3);
	$from =~ s/(\d{2})\/(\d{2})\/(\d{4})/$3-$1-$2/;
	$till =~ s/(\d{2})\/(\d{2})\/(\d{4})/$3-$1-$2/;
	if ($from le $now && $till gt $now) {
	  push @names, $name;
	}
      }
    }
  } else {
    # Everybody!  Everybody!
    my $query = {
		 action => 'query',
		 format => 'json',
		 utf8 => '1'
		};

    if (/steward/) {
      ${$query}{list} = 'globalallusers';
      ${$query}{agulimit} = 'max';
      ${$query}{agugroup} = $_;
    } else {
      ${$query}{list} = 'allusers';
      ${$query}{aulimit} = 'max';
      ${$query}{augroup} = $_;
    }

    # Usernames from reference to array of hash references
    my $ret = $mw->list($query);
    @names = map {$_->{name}} @{$ret};
  }

  # Generate JSON, sorted
  my $json = JSON::PP->new->canonical(1);
  $json = $json->indent(1)->space_after(1); # Make prettyish
  my %names = map {$_ => 1} @names;
  $json = $json->encode(\%names);

  write_text($file, $json);
  # Check if local records have changed
  my $status = $repo->run(status => $file, '--porcelain', {cwd => undef});
  if ($status) {
    $localChange = 1;
    print "$file changed\n\t";
  }

  # Pull on-wiki json
  my $pTitle = "User:Amorymeltzer/crathighlighter.js/$file";
  my $getPage = $mw->get_page({title => $pTitle});

  my $wikiSon = $getPage->{q{*}};
  write_text($wiki, $wikiSon);

  # Check if everything is up-to-date onwiki, optional push otherwise
  if (compare("$file","$wiki") != 0) {
    $wikiChange = 1;

    # Get .json synched then go for it
    write_text($wiki, $json);
    if ($status) {
      print 'and';
    } else {
      print "$file"
    }
    print " needs updating on-wiki.\n";

    if ($opts{p}) {
      $repo->run(reset => 'HEAD', q{--}); # Clear staging area just in case
      $repo->run(add => '*.wiki');
      my ($plusRef, $minusRef) = plusMinus($repo, $wiki);
      my $changes = buildSummary($plusRef,$minusRef);

      my $summary = 'Update ';
      if (length $changes) {
	$summary .= '('.$changes.') ';
      }
      $summary .='(automatically via [[User:Amorymeltzer/scripts#crathighlighter.js|script]])';
      my $timestamp = $getPage->{timestamp};

      print "\tPushing now...\n";
      $mw->edit({
		 action => 'edit',
		 title => $pTitle,
		 basetimestamp => $timestamp, # Avoid edit conflicts
		 text => $json,
		 summary => $summary
		});
      my $return = $mw->{response};
      print "\t$return->{_msg}\n";
      $repo->run(reset => 'HEAD', q{--}); # Back to clean staging area
    }
  } elsif ($status) {
    print "but already up-to-date\n";
  }
}

if ($localChange == 0 && $wikiChange == 0) {
  print "No updates needed\n";
} else {
  system '/opt/local/bin/terminal-notifier -message "Changes or updates made" -title "cratHighlighter"';

  # Autocommit changes
  if ($opts{c}) {
    my $commitMessage = "cratHighlighterSubpages: Update\n";
    $repo->run(reset => 'HEAD', q{--}); # Clear staging area just in case

    # Autocommit json changes
    if ($localChange == 1) {
      $repo->run(add => '*.json');
      my @cached = $repo->run(diff => '--name-only', '--staged');
      if (@cached) {

	# Build file abbreviation hash
	my %abbrevs;
	while (<DATA>) {
	  chomp;
	  my @map = split;
	  $abbrevs{$map[0]} = $map[1];
	}

	# Build message and commit
	foreach (sort @cached) {
	  s/.*\/(\S+\.json).*/$1/;
	  $commitMessage .= "\n$abbrevs{$_}";

	  my ($plusRef, $minusRef) = plusMinus($repo, $_);
	  my $changes = buildSummary($plusRef,$minusRef);
	  if (length $changes) {
	    $commitMessage .= ' ('.$changes.')';
	  }
	}
      }
    }

    $repo->run(add => '*.wiki'); # Always
    if ($repo->run(diff => '--name-only', '--staged')) {
      $commitMessage .= "\nUpdated local backups of on-wiki file(s)";
    }

    # Commit
    $repo->run(commit => '-m', "$commitMessage");
  }
}


#### SUBROUTINES
# Nicer handling of errors
# Can be expanded using:
## https://metacpan.org/release/MediaWiki-API/source/lib/MediaWiki/API.pm
## https://www.mediawiki.org/wiki/API:Errors_and_warnings#Standard_error_messages
sub dieNice {
  my $code = $mw->{error}->{code};
  my $details = $mw->{error}->{details};
  print color 'red';
  if ($code == 4) {
    print "Error logging in\n";
  } elsif ($code == 5) {
    print "Error editing the page\n";
  }
  print "$code: $details\n";
  die "Quitting\n";
}

# Process diff for usernames of added/removed.  Flag for cached or not
sub plusMinus {
  my ($r,$f) = @_;
  my (@p,@m);

  my $cmd = $r->command(diff => '--staged', q{--}, "$f", {cwd => undef});
  my $s = $cmd->stdout;
  if (!eof $s) { # Some output even exists
    while (<$s>) {
      if (/^[+-].+": 1,/) { # We know what the important lines look like, so abuse that
	chomp;
	my $name = s/([+-])\s+"(.*)": 1,.*/$1$2/r;
	my @map = split //, $name, 2;
	if ($map[0] eq q{+}) {
	  push @p, $map[1];
	} elsif ($map[0] eq q{-}) {
	  push @m, $map[1];
	}
      }
    }
    $cmd->close;
    return (\@p, \@m);
  }
}

# Create a commit/edit summary from the plus/minus in a diff.
# Uses oxfordComma below for proper grammar
# This could be part of plusMinus, but I like having it separate, even if it
# means dealing with a few more references
sub buildSummary {
  my ($pRef,$mRef) = @_;
  my $change;

  if ($pRef && ${$pRef}[0]) {
    $change .= 'Added '.oxfordComma(@{$pRef});
  }
  if ($mRef && ${$mRef}[0]) {
    if (length $change) {
      $change .= '; ';
    }
    $change .= 'Removed '.oxfordComma(@{$mRef});
  }

  return $change;
}

# Oxford comma
sub oxfordComma {
  my @list = @_;
  my $end = pop @list;
  if (@list) { # More than one
    my $ox = q{};
    if (scalar @list > 1) { # More than two, need an oxford comma
      $ox = q{,};
    }
    return join(', ', @list) . "$ox and $end";
  } else { # Just one entry
    return $end;
  }
}

#### Usage statement ####
# Use POD or whatever?
# Escapes not necessary but ensure pretty colors
# Final line must be unindented?
sub usage {
  print <<"USAGE";
Usage: $0 [-hpc]
      -p Push live to wiki
      -c Automatically commit changes in git
      -h print this message
USAGE
  return;
}


## The lines below do not represent Perl code, and are not examined by the
## compiler.  Rather, they are used by %abbrevs to map filenames from the
## Twinkle git repo to their corresponding location in the MediaWiki Gadget
## psuedonamespace.
__DATA__
arbcom.json AC
  bureaucrat.json B
  checkuser.json CU
  interface-admin.json IA
  oversight.json OS
  steward.json SW
