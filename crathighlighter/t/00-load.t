#!perl
use 5.006;
use strict;
use warnings;
use Test::More;

plan tests => 2;

BEGIN {
    use_ok('AmoryBot::CratHighlighter') || print "Bail out!\n";
    use_ok('AmoryBot::CratHighlighter::GitUtils') || print "Bail out!\n";
}
