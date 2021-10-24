#!/usr/bin/env perl
# Test the title processing regexes

use strict;
use warnings;
use English qw(-no_match_vars); # Avoid regex speed penalty in perl <=5.16

use diagnostics;

use Test::More;

use Const::Fast;
const my $T => 1;
const my $F => undef; # Necessary since false values in lookup hash will all be undef

# Match titles to whether they work or not
my %titles = (
	      Abies_abies => $T,
	      '0366-4473' => $F,
	      '0366_4473' => $F,
	      q{"Eupales"} => $F,
	      q{$} => $F,
	      '+_Pirocydonia_winkleri' => $F,
	      'A.A.Bobrov' => $F,
	      'A.A.Araújo' => $F,
	      'Abies_cilicica_subsp._cilicica' => $F,
	      'Abies_gamblei' => $F,
	      'Abies_nordmanniana_ssp._bornmulleriana' => $F,
	      'Abies_nordmanniana_ssp._nordmanniana' => $F,
	      'Abies_pinsapo_var._pinsapo' => $F,
	      'Abies_sect._Abies' => $F,
	      'Abralia_(Abralia)' => $F,
	      'Abraxas_(Abraxas)_aritai' => $F,
	      'Acanthoderes_(Acanthoderes)_uyapensis' => $F,
	      'Acanthogyrus_(Acanthogyrus)' => $F,
	      # Should probably fix this next one by just avoiding redirects tbh
	      'Acanthogyrus_(Acanthogyrus)_acanthogyrus' => $T,
	      'Aconogonon_×_fennicum' => $F,
	      'Aerangis_×primulina' => $F,
	      'Mó_Mó' => $T
	     );

my $count = scalar keys %titles;
plan tests => $count;
foreach my $title (sort keys %titles) {
  is(compare(cleanup($title)), $titles{$title}, $title);
}


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
    return $T;
  }
  return $F;
}
