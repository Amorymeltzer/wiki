#!/usr/bin/env perl

use 5.006;
use strict;
use warnings;

use AmoryBot::CratHighlighter qw(oxfordComma);
use Test::More tests => 5;

is(oxfordComma(), q{}, 'Empty');
is(oxfordComma('A'), 'A', 'Single item');
is(oxfordComma(qw(A B)), 'A and B', 'Two items');
is(oxfordComma(qw(A B C)), 'A, B, and C', 'Three items');
is(oxfordComma(qw(A B C D)), 'A, B, C, and D', 'Four items');
