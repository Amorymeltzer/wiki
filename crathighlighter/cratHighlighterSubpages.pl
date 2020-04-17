#!/usr/bin/env perl
# cratHighlighterSubpages.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Make it easier to sync subpages of crathighlighter.js
# https://en.wikipedia.org/wiki/User:Amorymeltzer/crathighlighter

use strict;
use warnings;
use diagnostics;

use Getopt::Std;
use Config::General qw(ParseConfig);
use MediaWiki::API;
use Git::Repository;
use File::Slurper qw(read_text write_text);
use JSON;

# Parse commandline options
my %opts = ();
getopts('hpc', \%opts);
if ($opts{h}) { usage(); exit; } # Usage

# Check repo before doing anything risky
my $repo = Git::Repository->new();
# if ($repo->run('rev-parse' => '--abbrev-ref', 'HEAD') ne 'master') {
#   print "Not on master branch, quitting\n";
#   exit 0;
# } elsif (scalar $repo->run(status => '--porcelain')) {
#   print "Repository is not clean, quitting\n";
#   exit;
# }

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

# Template for generating JSON, sorted
my $jsonTemplate = JSON::PP->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish

my ($commitMessage,%abbrevs); # Only used if -c but want global/not defined in if
if ($opts{c}) {
  $commitMessage = "cratHighlighterSubpages: Update\n";
  # Build file abbreviation hash
  while (<DATA>) {
    chomp;
    my @map = split;
    $abbrevs{$map[0]} = $map[1];
  }
}

# Bulk-grab content of each page
# It's easier to do multiple queries below but this is more polite
my @rights = qw (bureaucrat oversight checkuser interface-admin arbcom steward);
my @titles = map { 'User:Amorymeltzer/crathighlighter.js/'.$_.'.json' } @rights;
my $alltitles = join q{|}, @titles;
my $contentQuery = {
	     action => 'query',
	     prop => 'revisions',
	     rvprop => 'content',
	     titles => $alltitles,
	     format => 'json',
	     formatversion => 2 # Easier to iterate over
	    };
# JSON, technically a reference to a hash
my $queryReturn = $mw->api($contentQuery);
# Stores page title, content and last edited time in an array for each right
my %contentStore;
# This monstrosity results in an array where each item is an array of hashes:
## title -> set use to set the content, maybe use as key in data hash
## revisions -> array containing one item, which is a hash, which has keys:
### content -> content
### timestamp -> last edited
# Just awful.
my @pages = @{${${$queryReturn}{query}}{pages}};
foreach my $i (0..scalar @pages - 1) {
  my %page = %{$pages[$i]};
  my $title = $page{title} =~ s/.*\.js\/(.+)\.json/$1/r;
  my @revisions = @{$page{revisions}};
  my $content = ${$revisions[0]}{content};
  my $timestamp = ${$revisions[0]}{timestamp};
  $contentStore{$title} = [$page{title},$content,$timestamp];
}


# Main loop for each right
my ($localChange,$wikiChange) = (0,0);
foreach (@rights) {
  my %queryHash;

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
	  $queryHash{$name} = 1;
	}
      }
    }
  } else {
    # Defaults
    my $list = 'allusers';
    my $prefix = 'au';
    if (/steward/) {
      $list = 'global'.$list;
      $prefix = 'agu';
    }

    # Everybody!  Everybody!
    my $query = {
		 action => 'query',
		 list => $list,
		 $prefix.'group' => $_,
		 $prefix.'limit' => 'max',
		 format => 'json',
		 utf8 => '1'
		};

    # Usernames from reference to array of hash references
    my $ret = $mw->list($query);
    %queryHash = map {$_->{name} => 1} @{$ret};
  }

  # Build JSON, needed regardless
  my $queryJSON = $jsonTemplate->encode(\%queryHash);

  # Check if local records have changed
  my $fileJSON = read_text($file);
  my ($fileState, $fileAdded, $fileRemoved) = cmpJSON(\%queryHash, $jsonTemplate->decode($fileJSON));

  if ($fileState) {
    $localChange = 1;
    print "$file changed\n\t";
    # Write changes
    write_text($file, $queryJSON);

    # Stage, build edit summary
    if ($opts{c}) {
      $repo->run(add => "*$file");
      $commitMessage .= "\n$abbrevs{$file}";
      my $changes = buildSummary($fileAdded,$fileRemoved);
      if (length $changes) {
	$commitMessage .= ' ('.$changes.')';
      }
    }
  }

  # Check if on-wiki records have changed
  my $wikiJSON = $contentStore{$_}[1];
  my ($wikiState, $wikiAdded, $wikiRemoved) = cmpJSON(\%queryHash, $jsonTemplate->decode($wikiJSON));

  # Check if everything is up-to-date onwiki, optional push otherwise
  if ($wikiState) {
    $wikiChange = 1;

    # Get .json synched then go for it
    if ($fileState) {
      print 'and';
    } else {
      print "$file"
    }
    print " needs updating on-wiki.\n";

    if ($opts{p}) {
      my $changes = buildSummary($wikiAdded,$wikiRemoved);

      my $summary = 'Update ';
      if (length $changes) {
	$summary .= '('.$changes.') ';
      }
      $summary .='(automatically via [[User:Amorymeltzer/crathighlighter|script]])';
      my $timestamp = $contentStore{$_}[2];

      print "\tPushing now...\n";
      $mw->edit({
		 action => 'edit',
		 title => $contentStore{$_}[0],
		 basetimestamp => $timestamp, # Avoid edit conflicts
		 text => $queryJSON,
		 summary => $summary
		});
      my $return = $mw->{response};
      print "\t$return->{_msg}\n";
    }
  } elsif ($fileState) {
    print "but already up-to-date\n";
  }
}

if (!$localChange && !$wikiChange) {
  print "No updates needed\n";
  exit 0;
}

system '/opt/local/bin/terminal-notifier -message "Changes or updates made" -title "cratHighlighter"';

# Autocommit changes
if ($opts{c}) {
  $repo->run(commit => '-m', "$commitMessage");
}


#### SUBROUTINES
# Nicer handling of errors
# Can be expanded using:
## https://metacpan.org/release/MediaWiki-API/source/lib/MediaWiki/API.pm
## https://www.mediawiki.org/wiki/API:Errors_and_warnings#Standard_error_messages
sub dieNice {
  my $code = $mw->{error}->{code};
  my $details = $mw->{error}->{details};
  if ($code == 4) {
    print "Error logging in\n";
  } elsif ($code == 5) {
    print "Error editing the page\n";
  }
  print "$code: $details\n";
  die "Quitting\n";
}

# Compare query hash with a JSON object hash, return negated equality and
# arrays of added added and removed names from the JSON object
sub cmpJSON {
  my ($qRef, $oRef) = @_;

  my @qNames = sort keys %{$qRef};
  my @oNames = sort keys %{$oRef};

  my (@added, @removed);

  # Only if stringified arrays aren't equivalent
  my $state = "@qNames" ne "@oNames";
  if ($state) {
    # Check all names from the query first, will determine if anyone new
    # needs adding
    foreach (@qNames) {
      # Match in the other file
      if (!${$oRef}{$_}) {
	push @added, $_;
      } else {
	delete ${$oRef}{$_}; # Don't check again
      }
    }

    # Whatever is left should be anyone that needs removing; @oNames is
    # unreliable after above
    @removed = sort keys %{$oRef};
  }

  return ($state, \@added, \@removed);
};

# Create a commit/edit summary from the array references of added/removed
# usernames.  Uses oxfordComma below for proper grammar
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
  if (@list) {
    if (scalar @list < 3) {
      return join ' and ', @list;
    }
    my $end = pop @list;
    return join(', ', @list) . ", and $end";
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
## compiler.  Rather, they are used by %abbrevs to build nice commit messages.
__DATA__
arbcom.json AC
  bureaucrat.json B
  checkuser.json CU
  interface-admin.json IA
  oversight.json OS
  steward.json SW
