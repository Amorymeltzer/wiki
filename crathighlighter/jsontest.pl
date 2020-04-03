#!/usr/bin/env perl
# jsontest.pl by Amory Meltzer
# 

use strict;
use warnings;
use diagnostics;

use JSON;

my $string = 'this is a string';
my @array = qw (one two three);
my @array2 = ('one', 'two', $string);
my %hash = (
	    one => 'one',
	    two => 'two'
	   );
$hash{monkey} = 'monkey business';

print "string\t";
print encode_json $string;
print "\n";
print "array\t";
print encode_json @array;
print "\n";
print encode_json \@array;
print "\n";
print "array2\t";
print encode_json @array2;
print "\n";
print encode_json \@array2;
print "\n";
print "hash\t";
print encode_json %hash;
print "\n";
print encode_json \%hash;
print "\n";
