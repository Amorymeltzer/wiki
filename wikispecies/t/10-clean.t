#!/usr/bin/env perl

use strict;
use warnings;
use Test::More;

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



sub noParens {
  my $title = shift;
  $title =~ s/\(.*\)//x;       # get rid of text in parentheses
  $title =~ s/__/_/;	       # potential formatting issue as a result of above
  return $title;
}
sub rmOdds {
  return shift =~ s/[\+\?\(\)]//gxr;  # odd characters
}
sub noVars {
  my $title = shift;
  # Get rid of subspecies and variant names, remove if someone cares for those
  # FIXME TODO
  # _subsp. or _nothosubsp.
  # same for var.  Maybe also sp.?
  $title =~ s/subsp\..*$//x;
  $title =~ s/var\..*$//x;
  return $title;
}
