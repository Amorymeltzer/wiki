#!/usr/bin/env perl

use 5.036;

# Relies upon oxfordComma
use AmoryBot::CratHighlighter qw(changeSummary);
use Test::More tests => 6;

my @added   = qw(Acalamari AmandaNP Avraham);
my @removed = qw(Amorymeltzer Cyberpower678 Enterprisey);

# Bad data
is(changeSummary(),   undef, 'no addedRef');
is(changeSummary([]), undef, 'No removedRef');

# changeSummary relies on there being two array refs, so provide an empty ref
is(changeSummary([],      []),        q{},                                                                                            'Empty');
is(changeSummary(\@added, []),        'Added Acalamari, AmandaNP, and Avraham',                                                       'Added');
is(changeSummary([],      \@removed), 'Removed Amorymeltzer, Cyberpower678, and Enterprisey',                                         'Removed');
is(changeSummary(\@added, \@removed), 'Added Acalamari, AmandaNP, and Avraham; Removed Amorymeltzer, Cyberpower678, and Enterprisey', 'Added and removed');
