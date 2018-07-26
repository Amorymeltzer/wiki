#!/usr/bin/env perl
# table2csv.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/

# Process the table from XTools, convert the relevant to csv

## Maybe remove users known to never have been sysops?  Likely to come out in
## the wash.  Could also set a threshold?


use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);

# Keep track of where we are in the document
my $thereyet = 0;
my $line;

open my $input, '<', "$ARGV[0]" or croak $ERRNO;
# We really don't need to process the column headers, I know what I want
print "User,Totals\n";
while (<$input>) {
  chomp;

  # Only start looking once we get to the results table
  if ($thereyet == 0) {
    if (/sort-entry--rank/) {
      $thereyet++;
      $line = $NR;
    } else {
      next;
    }
  }

  # Skip the early ugliness, could probably jump ahead further...
  if (/sort-entry--username/) {
    s/.*sort-entry--username" data-value="(.*)">$/$1/;
    print "$_,";
  } elsif (/sort-entry--total/) {
    s/.*sort-entry--total" data-value="(.*)">\d+.*$/$1/;
    print "$_\n";
  }
}
close $input or die $ERRNO;
