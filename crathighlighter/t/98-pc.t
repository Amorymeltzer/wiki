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

# Defaults to 5.  Currently we pass down to 3, all I really care about, but
# maybe 4 is probably fine enough, and hopefully would mean not backtracking,
# but hey why not go for it?
use Test::Perl::Critic (-severity => 3);
all_critic_ok('lib/AmoryBot/CratHighlighter.pm', 'cratHighlighterSubpages.pl', 'gitSync.pl', 'proveme.pl', 't/');
