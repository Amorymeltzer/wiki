#!/usr/bin/env perl
# Test oxford comma subroutine

use strict;
use warnings;
use diagnostics;

use English;

use Test::More tests => 5;

is(oxfordComma(q{}), q{}, 'Empty');
is(oxfordComma('A'), 'A', 'Single item');
is(oxfordComma(qw(A B)), 'A and B', 'Two items');
is(oxfordComma(qw(A B C)), 'A, B, and C', 'Three items');
is(oxfordComma(qw(A B C D)), 'A, B, C, and D', 'Four items');


sub oxfordComma {
  my @list = @_;

  if (scalar @list < 3) {
    return join ' and ', @list;
  }
  my $end = pop @list;
  return join(', ', @list) . ", and $end";
}
