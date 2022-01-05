#!/usr/bin/env perl
# Perl::Critic tests

use strict;
use warnings;
use diagnostics;

# Defaults to 5, only showing the most severe.  Fine.
use Test::Perl::Critic;
use Test::More tests => 8;
all_critic_ok('cratHighlighterSubpages.pl', 'gitSync.pl', 't/');
