#!/usr/bin/env perl

use strict;
use warnings;

# Relies upon oxfordComma
use AmoryBot::CratHighlighter qw(buildNote);
use Test::More tests => 5;

my @added = ('Acalamari (B)', 'AmandaNP (OS)', 'Avraham (SYS)');
my @removed = ('Amorymeltzer (OS)', 'Cyberpower678 (SYS)', 'Enterprisey (IA)');

# Bad data
is(buildNote('Ford'), undef, 'No listRef');

is(buildNote('Ford', []), q{}, 'Empty list');

is(buildNote('Added', \@added), "\t".'Added: Acalamari (B), AmandaNP (OS), and Avraham (SYS)'."\n", 'Added');
is(buildNote('Removed', \@removed), "\t".'Removed: Amorymeltzer (OS), Cyberpower678 (SYS), and Enterprisey (IA)'."\n", 'Removed');
is(buildNote(q{}, \@added), "\t".': Acalamari (B), AmandaNP (OS), and Avraham (SYS)'."\n", 'Empty message');
