#!/usr/bin/env perl
# checkData.pl by Amory Meltzer
# Quality control on timestamps, etc.
## Need to update file format...

use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);

if (@ARGV != 2) {
  print "Usage: $PROGRAM_NAME <rawdatefile> <timestamp>\n";
  exit;
}

my ($dateFile,$timestamp) = @ARGV;

$dateFile =~ s/.txt//;
$timestamp =~ s/<\/?timestamp>//g;
$timestamp =~ s/T.*Z//;

print "$dateFile\t$timestamp\n";

if ($dateFile ne $timestamp) {
  #exit 1;
}
