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
print encode_json sort @array2;
print "\n";
print "hash\t";
print encode_json \%hash;
print "\n";
my $d = JSON::PP->new->canonical(1);
$d = $d->encode(\%hash);
print $d;
print "\n";
$d = encode_json \%hash;
print $d;
print "\n";


print join(' and ', qw(one two));
print "\n";
print join(' and ', qw(two));
print "\n";


use File::Slurper qw (read_text);
my $file = 'oversight.json';
my $fileText = read_text($file);
my $jsonTemplate = JSON::PP->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish
my $text = $jsonTemplate->decode($fileText);
use Data::Dumper;
print Dumper($text);

my $d = 0;
if (!$d) {
  print "hi\n";
}
