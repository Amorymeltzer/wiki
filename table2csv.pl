#!/usr/bin/env perl
# table2csv.pl by Amory Meltzer
# Process the wiki format from Special:Export, convert the relevant table to a
# csv file for processing
## Only want the totals???
## Quote names with commas?

use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);

# Keep track of where we are in the document
my $thereyet = 0;
my $line;

open my $input, '<', "$ARGV[0]" or croak $ERRNO;
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

  # Skip the early ugliness and the useless number column
  if ($NR > $line+7) {
    # Remove annotations, probably just want totals anyway though
    s/&lt;span title=&quot;//;
    s/&quot;&gt;\w+&lt;\/span&gt;//;
    # thisiswherethefunbegins.gif
    if (/^! /) {
      s/! //;
      print "$_,";
    } elsif (/\|-/) {
      print "\n";
      next;
    } elsif (/^\|\| /) {
      my @line = split / \|\| /;
      shift @line;
      print join q{,}, @line;
    }
  }
}
close $input or croak $ERRNO;
