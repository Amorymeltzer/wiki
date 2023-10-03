#!/usr/bin/env perl
# Test comparison of different JSON bodies

use 5.006;
use strict;
use warnings;

use AmoryBot::CratHighlighter qw(cmpJSON);
use Test::More;

# List users from each group.  Essentially cribbed from file.t/file.json, but
# without the one overlapper (Xaosflux)
my @buro = ('Acalamari', 'AmandaNP', 'Avraham', 'Bibliomaniac15', 'Cecropia', 'Deskana', 'Dweller', 'MBisanz', 'Maxim', 'Nihonjoe', 'Primefac', 'SilkTork', 'UninvitedCompany', 'Useight', 'Warofdreams', 'WereSpielChequers', 'Worm That Turned', 'Xeno');
my @inta = ('Amorymeltzer', 'Cyberpower678', 'Enterprisey', 'Evad37', 'Izno', 'MusikAnimal', 'MusikBot II', 'Oshwah', 'Ragesoss', 'Writ Keeper');


# Name of test points to array:
## First two: Array refs cum hash refs (via makeHash) passed to cmpJSON
## Last two are expected added/removed array refs, respectively
my %tests = (
	     empty => [([])x4],
	     identicalBuro => [(\@buro)x2, ([])x2],
	     identicalInta => [(\@inta)x2, ([])x2],
	     actual => [(\@buro, \@inta)x2]
	    );

my $count = scalar keys %tests;
plan tests => 3+3*$count;

# First one technically excessive
is(cmpJSON(), undef, 'empty');
is(cmpJSON('42'), undef, 'queryRef not hashref');
is(cmpJSON({}, '42'), undef, 'objectRef not hashref');


foreach my $test (sort keys %tests) {
  # Simulate the hashRef that results from parsing the JSON
  my %qr = makeHash(\@{$tests{$test}[0]});
  my %or = makeHash(\@{$tests{$test}[1]});

  my ($fileState, $fileAdded, $fileRemoved) = cmpJSON(\%qr, \%or);

  is($fileState, $test eq 'actual', "$test - Accurate state");
  is_deeply(\@{$fileAdded}, \@{$tests{$test}[2]}, "$test - Added");
  is_deeply(\@{$fileRemoved}, \@{$tests{$test}[3]}, "$test - Removed");
}



# Turn an array into a lookup hash, just for the sake of making matching the
# data easier.
sub makeHash {
  return map {$_ => 1} @{$_[0]};
}
