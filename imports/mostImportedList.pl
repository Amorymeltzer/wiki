#!/usr/bin/env perl
# mostImportedList.pl by Amory Meltzer
# Get the list of most imported user scripts
# https://en.wikipedia.org/wiki/Wikipedia:User_scripts/Most_imported_scripts

use strict;
use warnings;
use diagnostics;

# Get list
my $listUrl = 'https://en.wikipedia.org/w/index.php?title=Wikipedia:User_scripts/Most_imported_scripts&action=raw';
my $listRaw = `curl -s "$listUrl"`;

my $output = 'importedList.txt';
open my $out, '>', "$output" or die $1;
foreach (split /\n/, $listRaw) {
  if (/^\| \d+ \|\| \[\[(User:.+)\]\] \|\| \d+ \|\| \d+/) {
    print $out "enwiki\t$1\n";
  }
}
close $out or die $1;
