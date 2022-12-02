#!/usr/bin/env perl

use strict;
use warnings;

use AmoryBot::CratHighlighter qw(mapGroups);
use Test::More tests => 4;

is_deeply([mapGroups()], [], 'Empty');
is_deeply([mapGroups('arbcom', ['Bradv'])], ['Bradv (AC)'], 'Single array');
is_deeply([mapGroups('arbcom', ['Bradv', 'DGG'])], ['Bradv (AC)', 'DGG (AC)'], 'AC');
is_deeply([mapGroups('sysop', ['Bradv', 'Xeno', 'DGG'])], ['Bradv (SYS)', 'Xeno (SYS)', 'DGG (SYS)'], 'SYS');
