#!/usr/bin/env perl

use 5.036;

use AmoryBot::CratHighlighter qw(mapGroups);
use Test::More tests => 7;

# Bad data
is(mapGroups(),         undef, 'Empty');
is(mapGroups('purple'), undef, 'Bad group');

# Just group
is(mapGroups('arbcom'),          'AC', 'arbcom');
is(mapGroups('interface-admin'), 'IA', 'interface-admin');

# Group and users
is_deeply([mapGroups('arbcom', ['Bradv'])],               ['Bradv (AC)'],                             'Single array');
is_deeply([mapGroups('arbcom', ['Bradv', 'DGG'])],        ['Bradv (AC)', 'DGG (AC)'],                 'AC multi');
is_deeply([mapGroups('sysop', ['Bradv', 'Xeno', 'DGG'])], ['Bradv (SYS)', 'Xeno (SYS)', 'DGG (SYS)'], 'SYS multi');


# Other iterations? FIXME TODO
