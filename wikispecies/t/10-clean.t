#!perl

use 5.006;
use strict;
use warnings;
use Test::More;

use Wikispecies::GenusSpecies qw(noParens rmOdds noVars);

plan tests => 24;

# noParens
is(noParens('asd'), 'asd', 'No parens');

is(noParens('asd_(ddd)'), 'asd_', 'Simple case');
is(noParens('asd_(ddd)_dda'), 'asd_dda', 'Middle parens');
is(noParens('(ddd)'), q{}, 'Only parens');

# rmOdds
is(rmOdds('asd'), 'asd', 'No special characters');

is(rmOdds('asd_+'), 'asd_', 'Trailing +');
is(rmOdds('asd_+add'), 'asd_add', 'Middle +');
is(rmOdds('asd_+_add'), 'asd__add', 'Middle + with underscore');
is(rmOdds('+asd_add'), 'asd_add', 'Leading +');

is(rmOdds('asd_?'), 'asd_', 'Trailing ?');
is(rmOdds('asd_?add'), 'asd_add', 'Middle ?');
is(rmOdds('asd_?_add'), 'asd__add', 'Middle ? with underscore');
is(rmOdds('?asd_add'), 'asd_add', 'Leading ?');

is(rmOdds('asd_('), 'asd_', 'Trailing (');
is(rmOdds('asd_(add'), 'asd_add', 'Middle (');
is(rmOdds('asd_(_add'), 'asd__add', 'Middle ( with underscore');
is(rmOdds('(asd_add'), 'asd_add', 'Leading (');

is(rmOdds('asd_)'), 'asd_', 'Trailing )');
is(rmOdds('asd_)add'), 'asd_add', 'Middle )');
is(rmOdds('asd_)_add'), 'asd__add', 'Middle ) with underscore');
is(rmOdds(')asd_add'), 'asd_add', 'Leading )');

# noVars
is(noVars('asd'), 'asd', 'No variant or subspecies');

is(noVars('asd_subsp._ddd'), 'asd_', 'Middle subsp');
is(noVars('asd_var.._ddd'), 'asd_', 'Middle var');
