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
	      'A.A.Bobrov' => 0,
	      'A.A.Araújo' => 0,
	      'Abies_gamblei' => 0,
	      'Abies_sect._Abies' => 0,
	      'Abralia_(Abralia)' => 0,
	      'Acanthogyrus_(Acanthogyrus)' => 0,
	      'Aconogonon_×_fennicum' => 0,
	      'Aerangis_×primulina' => 0,
	      'Mó_Mó' => 1
	     );

my @titles = sort keys %titles;
my $count = scalar @titles;
plan tests => $count;
foreach my $title (@titles) {
  is(compareGP($title), !!$titles{$title}, $title);
}

sub compareGP {
  my @words = split /_/, shift; # array to hold each name

  return @words == 2 && lc $words[0] eq lc $words[1];
}
