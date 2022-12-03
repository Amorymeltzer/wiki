#!perl
use 5.006;
use strict;
use warnings;
use Test::More;

plan tests => 2;

BEGIN {
  use_ok( 'AmoryBot::CratHighlighter' ) || print "Bail out!\n";
  use_ok( 'AmoryBot::CratHighlighter::GitUtils' ) || print "Bail out!\n";
}

diag( "Testing AmoryBot::CratHighlighter $AmoryBot::CratHighlighter::VERSION, Perl $], $^X" );
diag( "Testing AmoryBot::CratHighlighter::GitUtils $AmoryBot::CratHighlighter::GitUtils::VERSION, Perl $], $^X" );
