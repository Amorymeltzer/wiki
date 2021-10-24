#!/usr/bin/env perl

use strict;
use warnings;
use Test::More;

# Match titles to whether they work or not
my %titles = (
	      Abies_abies => 1,
	      '0366-4473' => 0,
	      '0366_4473' => 0,
	      q{"Eupales"} => 0,
	      q{$} => 0,
	      '+_Pirocydonia_winkleri' => 0,
	      'A.A.Bobrov' => 0,
	      'A.A.Araújo' => 0,
	      'Abies_cilicica_subsp._cilicica' => 0,
	      'Abies_gamblei' => 0,
	      'Abies_nordmanniana_ssp._bornmulleriana' => 0,
	      'Abies_nordmanniana_ssp._nordmanniana' => 0,
	      'Abies_pinsapo_var._pinsapo' => 0,
	      'Abies_sect._Abies' => 0,
	      'Abralia_(Abralia)' => 0,
	      'Abraxas_(Abraxas)_aritai' => 0,
	      'Acanthoderes_(Acanthoderes)_uyapensis' => 0,
	      'Acanthogyrus_(Acanthogyrus)' => 0,
	      # Should probably fix this next one by just avoiding redirects tbh
	      'Acanthogyrus_(Acanthogyrus)_acanthogyrus' => 1,
	      'Aconogonon_×_fennicum' => 0,
	      'Aerangis_×primulina' => 0,
	      'Mó_Mó' => 1
	     );


my @titles = sort keys %titles;
my $count = scalar @titles;
plan tests => $count;
foreach my $title (@titles) {
  is(compareGP(cleanup($title)), !!$titles{$title}, $title);
}

# The cleanup process
sub cleanup {
  my $title = shift;

  $title = noVars($title);
  $title = noParens($title);	# Must be after rmOdds for the time being
  $title = rmOdds($title);

  return $title;
}
sub noParens {
  my $title = shift;
  $title =~ s/\(.*\)//x;       # get rid of text in parentheses
  $title =~ s/__/_/;	       # potential formatting issue as a result of above
  return $title;
}
sub rmOdds {
  return shift =~ s/[\+\?\(\)]//gxr;  # odd characters
}
sub noVars {
  my $title = shift;
  # Get rid of subspecies and variant names, remove if someone cares for those
  # FIXME TODO
  # _subsp. or _nothosubsp.
  # same for var.  Maybe also sp.?
  $title =~ s/subsp\..*$//x;
  $title =~ s/var\..*$//x;
  return $title;
}

# The actual comparison process
sub compareGP {
  my @words = split /_/, shift; # array to hold each name

  return @words == 2 && lc $words[0] eq lc $words[1];
}
