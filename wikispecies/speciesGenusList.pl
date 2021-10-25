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

use lib q{./lib};
use Wikispecies::GenusSpecies;

if (@ARGV != 1) {
  print "Usage: $PROGRAM_NAME <species list>\n";
  exit;
}

my $input = $ARGV[0];

open my $list, '<', "$input" or die $ERRNO;
while (my $species = <$list>) {
  chomp $species;
  # Cleanup titles before checking
  $species = noVars($species);
  $species = noParens($species); # Must be after rmOdds for the time being
  $species = rmOdds($species);

  my @words = compareGP($species);
  if (scalar @words) {
    print "$words[0]_$words[1]\n";
  }
}
close $list or die $ERRNO;
