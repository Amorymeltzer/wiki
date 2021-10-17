#!/usr/bin/env perl
# Perl::Critic tests

use strict;
use warnings;
use diagnostics;

# Defaults to 5, the most severe.  Fine.
use Test::Perl::Critic;
use Test::More tests => 7;
all_critic_ok('cratHighlighterSubpages.pl', 't/');
