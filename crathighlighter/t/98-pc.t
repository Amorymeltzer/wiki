#!/usr/bin/env perl
# Perl::Critic tests

use strict;
use warnings;

use Test::More;

if ($ENV{RELEASE_TESTING} || $ENV{LOGNAME} eq 'tools.amorybot') {
  plan tests => 18;
} else {
  plan skip_all => 'Tests annoying when developing';
}

# Defaults to 5, only showing the most severe.  Fine.
use Test::Perl::Critic;
all_critic_ok('lib/AmoryBot/CratHighlighter.pm', 'cratHighlighterSubpages.pl', 'gitSync.pl', 'proveme.pl', 't/');
