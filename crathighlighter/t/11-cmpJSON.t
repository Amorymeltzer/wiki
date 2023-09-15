#!/usr/bin/env perl
# Test comparison of different JSON bodies

use strict;
use warnings;

use File::Slurper qw(read_text);
use JSON::MaybeXS;

# Relies upon processFileData
use AmoryBot::CratHighlighter qw(cmpJSON processFileData);
use Test::More;

# List users from each group.  Essentially cribbed from file.t, but without the
# one overlapper (Xaosflux)
my @buro = ('Acalamari', 'AmandaNP', 'Avraham', 'Bibliomaniac15', 'Cecropia', 'Deskana', 'Dweller', 'MBisanz', 'Maxim', 'Nihonjoe', 'Primefac', 'SilkTork', 'UninvitedCompany', 'Useight', 'Warofdreams', 'WereSpielChequers', 'Worm That Turned', 'Xeno');
my @inta = ('Amorymeltzer', 'Cyberpower678', 'Enterprisey', 'Evad37', 'Izno', 'MusikAnimal', 'MusikBot II', 'Oshwah', 'Ragesoss', 'Writ Keeper');

# Template for generating JSON, sorted
my $jsonTemplate = JSON->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish

my $file = 't/file.json';
my $fileJSON = read_text($file);

my $contentReturn = $jsonTemplate->decode($fileJSON);
# Stores page title, content, and last edited time in an array for each group
my %contentData = processFileData($contentReturn);

# Name of test points to array:
## First two items: Parameters passed to cmpJSON
## Last two are expected added/removed array refs, respectively
my %tests = (
	     actual => [$jsonTemplate->decode($contentData{bureaucrat}[1]), $jsonTemplate->decode($contentData{'interface-admin'}[1]), \@buro, \@inta],
	     identical => [($jsonTemplate->decode($contentData{'bureaucrat'}[1]))x2, ([])x2],
	     empty => [({})x2, ([])x2] # Empty hash ref, empty array ref
	    );

my $count = scalar keys %tests;
plan tests => $count*3 + 2;

is(cmpJSON('42'), undef, 'return when not hashref');
is(cmpJSON({}, '42'), undef, 'return when not hashref');

foreach my $test (sort keys %tests) {
  my ($fileState, $fileAdded, $fileRemoved) = cmpJSON($tests{$test}[0], $tests{$test}[1]);
  is($fileState, $test eq 'actual', "$test - Accurate state");
  is_deeply(\@{$fileAdded}, \@{$tests{$test}[2]}, "$test - Added");
  is_deeply(\@{$fileRemoved}, \@{$tests{$test}[3]}, "$test - Removed");
}
