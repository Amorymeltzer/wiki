#!/usr/bin/env perl
# os.pl by Amory Meltzer
# Process quarry querys

use strict;
use warnings;
use diagnostics;

if (@ARGV != 1 || ! -e -f -r $ARGV[0]) {
  print "Input table required\n";
  exit 1;
}

use URI::Escape;

my %namespaces;
while (<DATA>) {
  chomp;
  my @map = split q{ }, $_, 2;
  $namespaces{$map[0]} = $map[1].q{:};
}
# Mainspace needs to be handled differently
$namespaces{0} =~ s/Main//;

my $input = $ARGV[0];
my $output = $input.'.out';
open my $in, '<', "$input" or die $1;
open my $out, '>', "$output" or die $1;
while (my $line = <$in>) {
  if ($line =~ /^\|(\d+)\|\|(.*?)\|\|(\d+)\|\|(.*?)\|\|/) {
    my $namespace = $namespaces{$3} // 'error';
    my $escaped = uri_escape($4);
    $line =~ s/^\|(\d+)\|\|(.*?)\|\|(\d+)\|\|.*?\|\|/|$1||[[User:$2|$2]]||$3||[[Special:Undelete\/$namespace$escaped|$namespace$escaped]]||/ix;
  }

  print $out "$line";
}
close $in or die $1;
close $out or die $1;


## The lines below do not represent Perl code, and are not examined by the
## compiler.  Rather, they are used to look up the canonical name for a given
## namespace number.  Colons and mainspace are handled later.
__DATA__
0 Main
  1 Talk
  2 User
  3 User talk
  4 Wikipedia
  5 Wikipedia talk
  6 File
  7 File talk
  8 MediaWiki
  9 MediaWiki talk
  10 Template
  11 Template talk
  12 Help
  13 Help talk
  14 Category
  15 Category talk
  100 Portal
  101 Portal talk
  108 Book
  109 Book talk
  118 Draft
  119 Draft talk
  828 Module
  829 Module talk
