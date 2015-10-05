#!/usr/bin/env perl
# makeWikiSpeciesLinks.pl by Amory Meltzer
# Make a list of links to various Wikispecies pages

use strict;
use warnings;
use diagnostics;

unless (@ARGV == 1) {
  print "Usage: makeWikiSpeciesLinks.pl <species_list.txt>\n";
  exit;
}

open my $list, '<', "$ARGV[0]" or die $!;

while (<$list>) {
  chomp;
  print "https://species.wikimedia.org/wiki/$_\n";
}

close $list or die $!;
