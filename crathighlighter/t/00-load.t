#!perl
use 5.006;
use strict;
use warnings;
use Test::More;

plan tests => 1;

BEGIN {
    use_ok( 'AmoryBot::CratHighlighter' ) || print "Bail out!\n";
}

diag( "Testing AmoryBot::CratHighlighter $AmoryBot::CratHighlighter::VERSION, Perl $], $^X" );
