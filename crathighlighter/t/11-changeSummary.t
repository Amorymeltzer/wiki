#!/usr/bin/env perl

use 5.036;

# Relies upon oxfordComma
use AmoryBot::CratHighlighter qw(changeSummary);
use Test::More tests => 6;
use Test::Fatal;

my $added   = [qw(AmandaNP Avraham)];
my $removed = [qw(Amorymeltzer Cyberpower678 Enterprisey)];

# Bad data
like(exception {changeSummary()},   qr/Missing data/, 'No addedRef');
like(exception {changeSummary([])}, qr/Missing data/, 'No removedRef');

# changeSummary relies on there being two array refs, so provide an empty ref
is(changeSummary([],     []),       q{},                                                                                'Empty');
is(changeSummary($added, []),       'Added AmandaNP and Avraham',                                                       'Added');
is(changeSummary([],     $removed), 'Removed Amorymeltzer, Cyberpower678, and Enterprisey',                             'Removed');
is(changeSummary($added, $removed), 'Added AmandaNP and Avraham; Removed Amorymeltzer, Cyberpower678, and Enterprisey', 'Added and removed');
