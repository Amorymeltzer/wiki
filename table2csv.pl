#!/usr/bin/env perl
# table2csv.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Process the wiki format from Special:Export, convert the relevant table to a
# csv file for processing

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

  # Only grab the totals table
  if ($thereyet == 0) {
    if (/All Totals/) {
      $thereyet++;
      $line = $NR;
    } else {
      next;
    }
  }

  # Skip the early ugliness, could probably jump ahead further...
  if ($NR > $line+6) {
    if (/^[!(\|\-)\{] /) {
      next;
    } elsif (/^\|\| /) {
      # Only want user and totals
      my @line = (split / \|\| /)[1,-1];
      $line[0] =~ s/,//g;	# Remove commas in usernames
      print join q{,}, @line;
      print "\n";
    }
  }
}
close $input or croak $ERRNO;
