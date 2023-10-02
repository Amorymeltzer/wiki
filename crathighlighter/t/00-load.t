#!/usr/bin/env perl

use 5.006;
use strict;
use warnings;

use Test::More;

plan tests => 4;

BEGIN {
    use_ok('AmoryBot::CratHighlighter') or BAIL_OUT "Couldn't load module AmoryBot::CratHighlighter\n";
    use_ok('AmoryBot::CratHighlighter', qw(:all)) or BAIL_OUT "Couldn't load module AmoryBot::CratHighlighter qw(:all)\n";
    use_ok('AmoryBot::CratHighlighter::GitUtils') or BAIL_OUT "Couldn't load module AmoryBot::CratHighlighter::GitUtils\n";
    use_ok('AmoryBot::CratHighlighter::GitUtils', qw(:all)) or BAIL_OUT "Couldn't load module AmoryBot::CratHighlighter::GitUtils qw(:all)\n";
}
