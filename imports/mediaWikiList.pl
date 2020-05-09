#!/usr/bin/env perl
# mediaWikiList.pl by Amory Meltzer
# Get all js pages in MediaWiki space
# Not just gadgets from list=gadgets

use strict;
use warnings;
use diagnostics;

# Get list
my $jsUrl = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&formatversion=2&srsearch=contentmodel%3Ajavascript&srnamespace=8&srlimit=max&srinfo=&srprop=&srsort=last_edit_desc';
my $jsRaw = `curl -s "$jsUrl"`;

my $output = 'mw.txt';
open my $out, '>', "$output" or die $1;
foreach (split /,/, $jsRaw) {
  if (/^\s*"title": ?"(.+)"/) {
    print $out "enwiki\t$1\n";
  }
}
close $out or die $1;
