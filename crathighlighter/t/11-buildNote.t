#!/usr/bin/env perl

use 5.036;

# Relies upon oxfordComma
use AmoryBot::CratHighlighter qw(buildNote);
use Test::More tests => 5;
use Test::Fatal;

my @added   = ('Acalamari (B)',     'AmandaNP (OS)',       'Avraham (SYS)');
my @removed = ('Amorymeltzer (OS)', 'Cyberpower678 (SYS)', 'Enterprisey (IA)');

# Bad data
like(exception {buildNote('Ford')}, qr/Missing data/, 'No listRef');

is(buildNote('Ford', []), q{}, 'Empty list');

is(buildNote('Added',   \@added),   "\t".'Added: Acalamari (B), AmandaNP (OS), and Avraham (SYS)',                'Added');
is(buildNote('Removed', \@removed), "\t".'Removed: Amorymeltzer (OS), Cyberpower678 (SYS), and Enterprisey (IA)', 'Removed');
is(buildNote(q{},       \@added),   "\t".': Acalamari (B), AmandaNP (OS), and Avraham (SYS)',                     'Empty message');
