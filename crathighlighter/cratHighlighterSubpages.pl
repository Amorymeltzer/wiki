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


my $repo = Git::Repository->new();
if ($repo->run('rev-parse' => '--abbrev-ref', 'HEAD') ne 'master') {
  print "Not on master branch, quitting\n";
  exit 0;
} elsif (scalar $repo->run(status => '--porcelain')) {
  print "Repository is not clean, quitting\n";
  exit;
}

# Quick dumb check for internet connection, everything empty otherwise
# Could probably subroutine a curl check, but meh
my $ip = `curl -s 'icanhazip.com'`;
if (!$ip) {
  print "No internet connection found, quitting\n";
  exit 0;
}

# Parse commandline options
my %opts = ();
getopts('hp', \%opts);
if ($opts{h}) { usage(); exit; } # Usage

# Config file should be a simple file consisting of username and botpassword
# username = Jimbo Wales
# password = stochasticstring
my %conf;
my $config_file = "$ENV{HOME}/.crathighlighterrc";
%conf = ParseConfig($config_file) if -e -f -r $config_file;

my $mw = MediaWiki::API->new({
			      api_url => 'https://en.wikipedia.org/w/api.php'
			     });
$mw->{ua}->agent('cratHighlighterSubpages.pl ('.$mw->{ua}->agent.')');
$mw->login({lgname => $conf{username}, lgpassword => $conf{password}})
  or die "Error logging in: $mw->{error}->{code}: $mw->{error}->{details}\n";

my $output = 0;
my @rights = qw (bureaucrat oversight checkuser interface-admin arbcom steward);
foreach (@rights) {
  my @names;

  my $file = $_.'.json';

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
    last if $now =~ /-12-31/; # For dumb template reasons, arbs are listed
                              # as ending terms on December 30th.  While
                              # unlikely, this means the list won't be
                              # accurate on the 31st, so just skip it.
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
    my $ret = $mw->list($query) || die "$mw->{error}->{code}: $mw->{error}->{details}\n";
    @names = map {$_->{name}} @{$ret};
  }

  my $json = '{';
  foreach (sort @names) {
    $json .= "\n    \"$_\": 1";
    if ($_ ne (sort @names)[-1]) {
      $json.= q{,};
    }
  }
  $json .= "\n}";

  write_text($file, $json);
  my $status = $repo->run(status => $file, '--porcelain', {cwd => undef});
  if ($status) {
    $output = 1;
    print "$file changed\n\t";
  }

  # Check that everything is up-to-date onwiki, push otherwise
  my $pTitle = "User:Amorymeltzer/crathighlighter.js/$file";
  my $getPage = $mw->get_page({title => $pTitle}) or die "$mw->{error}->{code}: $mw->{error}->{details}\n";

  my $wikiSon = $getPage->{q{*}};
  my $tmp = $_.'tmp';
  write_text($tmp, $wikiSon);

  if (compare("$file","$tmp") != 0) {
    $output = 1;
    if ($status) {
      print 'and';
    } else {
      print "$file"
    }
    print " needs updating on-wiki.\n";
    if ($opts{p}) {
      print "\tPushing now...\n";
      my $timestamp = $getPage->{timestamp};
      $mw->edit({
		 action => 'edit',
		 title => $pTitle,
		 basetimestamp => $timestamp, # Avoid edit conflicts
		 text => $json,
		 summary => 'Update (automatically via [[User:Amorymeltzer/scripts#crathighlighter.js|script]])'
		}) || die "Error editing the page: $mw->{error}->{code}: $mw->{error}->{details}\n";
      my $return = $mw->{response};
      print "\t$return->{_msg}\n";
    }
  } elsif ($status) {
    print "but already up-to-date\n";
  }

  unlink $tmp;
}

if ($output == 0) {
  print "No updates needed\n";
} else {
  system 'growlnotify -t "cratHighlighter" -m "Changes or updates made"';
}


#### Usage statement ####
# Use POD or whatever?
# Escapes not necessary but ensure pretty colors
# Final line must be unindented?
sub usage
  {
    print <<USAGE;
Usage: $0 [-hp]
      -p Push live to wiki
      -h print this message
USAGE
    return;
  }
