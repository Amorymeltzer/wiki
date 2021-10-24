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
while (my $species = <$list>) {
  chomp $species;
  # Cleanup titles before checking
  $species = cleanup($species);

  my @words = compare($species);
  if (@words) {
    print "$words[0]_$words[1]\n";
  }
}
close $list or die $ERRNO;


######## SUBROUTINES ########
# The cleanup process
sub cleanup {
  my $title = shift;

  $title =~ s/\(.*\)//x;       # get rid of text in parentheses
  $title =~ s/__/_/;	       # potential formatting issue as a result of above
  $title =~ s/[\+\?\(\)]//gx;  # odd characters

  # Should probably test the following more... #####FIXME######
  # $title =~ s/×//x; # NOT AN X (x Vs. ×) this denotes crosses, muddies things up if you uncomment

  # Get rid of subspecies and variant names, remove if someone cares for those
  $title =~ s/subsp\..*$//x;
  $title =~ s/var\..*$//x;

  return $title;
}

# The actual comparison process
sub compare {
  my @words = split /_/, shift; # array to hold each name

  if (@words == 2 && $words[0] =~ m/^$words[1]$/ix) {
    return @words;
  }
  return ();
}
