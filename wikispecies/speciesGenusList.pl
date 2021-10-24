#!/usr/bin/env perl
# speciesGenusList.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Parse a list of species for those with identical genus and species names
# Data from Wikispecies: http://dumps.wikimedia.org/backup-index.html
# Use all title from mainspace
# Consider > to genus_species_date after uniq due to some weird dupes I didn't fix

use strict;
use warnings;
use English qw(-no_match_vars); # Avoid regex speed penalty in perl <=5.16

use diagnostics;

if (@ARGV != 1) {
  print "Usage: $PROGRAM_NAME <species list>\n";
  exit;
}

my $input = $ARGV[0];

open my $list, '<', "$input" or die $ERRNO;
while (<$list>) {
  chomp;

  # Cleanup titles before checking
  s/\(.*\)//x;		       # get rid of text in parentheses
  s/__/_/;		       # potential formatting issue as a result of above
  s/[\+\?\(\)]//gx;	       # odd characters
  # Should probably test the following more... #####FIXME######
  #    s/×//x; # NOT AN X (x Vs. ×) this denotes crosses, muddies things up if you uncomment

  # Get rid of subspecies and variant names, remove if someone cares for those
  s/subsp\..*$//x;
  s/var\..*$//x;


  my @words = split /_/;	# array to hold each name
  print "$words[0]_$words[1]\n" if ((@words == 2) && ($words[0] =~ m/^$words[1]$/ix));
}
close $list or die $ERRNO;
