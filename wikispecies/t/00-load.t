#!perl
use 5.006;
use 5.006;
use strict;
use warnings;
use Test::More;

plan tests => 1;

BEGIN {
    use_ok('Wikispecies::GenusSpecies');
}

diag( "Testing Wikispecies::GenusSpecies $Wikispecies::GenusSpecies::VERSION, Perl $], $^X" );
