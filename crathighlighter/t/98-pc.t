#!/usr/bin/env perl
# Perl::Critic tests

use strict;
use warnings;

use Test::More;

if ($ENV{RELEASE_TESTING} || $ENV{LOGNAME} eq 'tools.amorybot') {
  plan tests => 19;
} else {
  plan skip_all => 'Tests annoying when developing';
}

# Defaults to 5.  Currently we pass down to 3 locally and on toolforge, but to
# pass on GitHub actions means keeping a local perlcriticrc file, which I don't
# care to do
use Test::Perl::Critic;
all_critic_ok('lib/AmoryBot/CratHighlighter.pm', 'cratHighlighterSubpages.pl', 'gitSync.pl', 'proveme.pl', 't/');
