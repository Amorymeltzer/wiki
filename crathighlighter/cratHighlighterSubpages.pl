#!/usr/bin/env perl
# cratHighlighterSubpages.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Make it somewhat easier to sync crathighlighter.js
# https://en.wikipedia.org/wiki/User:Amorymeltzer/crathighlighter.js

use strict;
use warnings;
use diagnostics;

my @rights = qw (bureaucrat oversight checkuser interface-admin arbcom steward);

foreach (@rights) {
  my $file = $_.'.json';
  my $hash = `md5 -q $file`;

  my $url;
  if (/arbcom/) {
    # Imperfect, relies upon the template being updated, but ArbCom membership
    # is high-profile enough that it will likely be updated quickly
    $url = 'https://en.wikipedia.org/w/index.php?title=Template:Arbitration_committee_chart/recent&action=raw&ctype=text';
  } elsif (/steward/) {
    $url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=globalallusers&agulimit=max&agugroup=steward';
  } else {
    $url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=allusers&aulimit=max&augroup=';
    $url .= $_;
  }
  my $json = `curl -s "$url"`;

  if (/arbcom/) {
    my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime time ;
    $year += 1900;
    $mon++;
    my $now = $year.q{-}.$mon.q{-}.$mday;
    last if $now =~ /-12-31/;	# For dumb template reasons, arbs are listed
                                # as ending terms on December 30th.  While
                                # unlikely, this means the list won't be
                                # accurate on the 31st, so just skip it.
    my @names;
    my $newSon = '{';
    for (split /^/, $json) {
      if (/from:(\d{2}\/\d{2}\/\d{4}) till:(\d{2}\/\d{2}\/\d{4}).*\[\[User:.*\|(.*)\]\]/) {
	my ($from,$till,$name) = ($1,$2,$3);
	$from =~ s/(\d{2})\/(\d{2})\/(\d{4})/$3-$1-$2/;
	$till =~ s/(\d{2})\/(\d{2})\/(\d{4})/$3-$1-$2/;
	if ($from le $now && $till ge $now) {
	  push @names, $name;
	}
      }
    }
    foreach (sort @names) {
      $newSon .= "\n    \"$_\": 1";
      if ($_ ne (sort @names)[-1]) {
	$newSon.= q{,};
      }
    }
    $newSon .= "\n}";
    $json = $newSon;
  } else {
    $json =~ s/]}}$/}/g;
    $json =~ s/{"batchcomplete.*allusers.*query.*allusers":\[/{\n/g;
    $json =~ s/{"(?:user)?id":"?\d+"?,"name":"(.*?)"}(,?)/    "$1": 1$2\n/g;
  }

  open my $out, '>', "$file" or die $1;
  print $out $json;
  close $out or die $1;

  my $newHash = `md5 -q $file`;
  if ($hash ne $newHash) {
    print "$file changed\n";
  }
}
