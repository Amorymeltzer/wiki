#!/usr/bin/env perl
# cratHighlighterSubpages.pl by Amory Meltzer
# Make it somewhat easier to sync crathighlighter.js
# ArbCom still manual
# https://en.wikipedia.org/wiki/User:Amorymeltzer/crathighlighter.js

use strict;
use warnings;
use diagnostics;

my @rights = qw (bureaucrat oversight checkuser interface-admin);

foreach (@rights) {
  my $file = $_.'.json';
  my $hash = `md5 -q $file`;

  my $url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=allusers&aulimit=max&augroup=';
  $url .= $_;
  my $json = `curl -s "$url"`;

  $json =~ s/]}}$/}/g;
  $json =~ s/{"batchcomplete.*allusers.*query.*allusers":\[/{\n/g;
  $json =~ s/{"userid":\d+,"name":"(.*?)"}(,?)/    "$1": 1$2\n/g;

  open my $out, '>', "$file" or die $1;
  print $out $json;
  close $out or die $1;

  my $newHash = `md5 -q $file`;
  if ($hash ne $newHash) {
    print "$file changed\n";
  }
}
