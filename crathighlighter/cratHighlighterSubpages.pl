#!/usr/bin/env perl
# cratHighlighterSubpages.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Make it somewhat easier to sync crathighlighter.js
# https://en.wikipedia.org/wiki/User:Amorymeltzer/crathighlighter.js

use strict;
use warnings;
use diagnostics;

use Config::General qw(ParseConfig);
use MediaWiki::API;
use File::Slurper qw(write_text);

# Quick dumb check for internet connection, everything empty otherwise
# Could probably subroutine a curl check, but meh
my $ip = `curl -s 'icanhazip.com'`;
if (!$ip) {
  print "No internet connection found, quitting\n";
  exit 0;
}

# Config file should be a simple file consisting of username and botpassword
# username = Jimbo Wales
# password = stochasticstring
my %conf;
my $config_file = "$ENV{HOME}/.crathighlighterrc";
%conf = ParseConfig($config_file) if -e -f -r $config_file;

my $mw = MediaWiki::API->new({
			      api_url => 'https://en.wikipedia.org/w/api.php'
			     });
$mw->login({lgname => $conf{username}, lgpassword => $conf{password}})
  or die "Error logging in: $mw->{error}->{code}: $mw->{error}->{details}\n";

my @rights = qw (bureaucrat oversight checkuser interface-admin arbcom steward);
foreach (@rights) {
  my @names;

  my $file = $_.'.json';
  my $hash = `md5 -q $file`;

  my $url;
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
    last if $now =~ /-12-31/;	# For dumb template reasons, arbs are listed
                                # as ending terms on December 30th.  While
                                # unlikely, this means the list won't be
                                # accurate on the 31st, so just skip it.
    for (split /^/, $content) {
      if (/from:(\d{2}\/\d{2}\/\d{4}) till:(\d{2}\/\d{2}\/\d{4}).*\[\[User:.*\|(.*)\]\]/) {
	my ($from,$till,$name) = ($1,$2,$3);
	$from =~ s/(\d{2})\/(\d{2})\/(\d{4})/$3-$1-$2/;
	$till =~ s/(\d{2})\/(\d{2})\/(\d{4})/$3-$1-$2/;
	if ($from le $now && $till ge $now) {
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
  my $newHash = `md5 -q $file`;
  if ($hash ne $newHash) {
    print "$file changed\n";
  }

  # Check that everything is up-to-date onwiki, push otherwise
  my $pTitle = "User:Amorymeltzer/crathighlighter.js/$file";
  my $getPage = $mw->get_page({title => $pTitle}) or die "$mw->{error}->{code}: $mw->{error}->{details}\n";

  my $wikiSon = $getPage->{q{*}};
  my $tmp = $_.'tmp';
  write_text($tmp, $wikiSon);

  my $wikiHash = `md5 -q $tmp`;
  if ($newHash ne $wikiHash) {
    if ($newHash ne $hash) {
      print "\tand ";
    } else {
      print "$file ";
    }
    print "needs updating on-wiki.  Pushing now...\n";
    my $timestamp = $getPage->{basetimestamp};
    $mw->edit({
	       action => 'edit',
	       title => $pTitle,
	       basetimestamp => $timestamp, # Avoid edit conflicts
	       text => $json,
	       summary => 'Update (automatically via [[User:Amorymeltzer/scripts#crathighlighter.js|script]])'
	      }) || die "Error editing the page: $mw->{error}->{code}: $mw->{error}->{details}\n";
    my $return = $mw->{response};
    print "\t$return->{_msg}\n";
  } else {
    print "No updates needed for $file\n";
  }

  unlink $tmp;
}
