#!/usr/bin/env perl

use 5.036;

use AmoryBot::CratHighlighter qw(emptyGroups);
use Test::More tests => 6;
use Test::Fatal qw(exception);

my %groups = (sysop => {AmandaNP => 1}, arbcom => {Barkeep49 => 1, L235 => 1}, oversight => {}, steward => undef);

# Bad data
like(exception {emptyGroups()},         qr/Missing data/, 'No groupsRef');
like(exception {emptyGroups(\%groups)}, qr/Missing data/, 'No rightsRef');


is_deeply([emptyGroups(\%groups, [])],                            [],                      'No rights to check');
is_deeply([emptyGroups(\%groups, [qw(sysop arbcom)])],            [],                      'All set');
is_deeply([emptyGroups(\%groups, [qw(sysop oversight)])],         ['oversight'],           'Empty');
is_deeply([emptyGroups(\%groups, [qw(steward checkuser)])],       [qw(steward checkuser)], 'Undef and missing');
