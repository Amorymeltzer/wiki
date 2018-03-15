#!/usr/bin/env perl
# getDates.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Figure out which dates we need to download
## Data starts September 2008 (could do August, but meh)


use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);

# Earliest reliable data is from Semptember 2008, don't use anything older
# my ($startYear,$startMonth) = (2008,8);
# Format changed in feb 2010, so for now can just do this.
my ($startYear,$startMonth) = (2012,3);
# 0-indexed
my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime;
# Not anymore!
$mon++;
# 1900-indexed
my $endYear = $year+1900;

# Date of last data grab
if (@ARGV) {
  ($startYear,$startMonth) = split /-/, $ARGV[0];
}


# Process dates, grab data
my $date;
for my $year (($startYear..$endYear)) {
  for my $month (1..12) {
    # Don't start too early
    next if ($year == $startYear && $month <= $startMonth);
    # Don't go into the future
    next if ($year == $endYear && $month > $mon);

    $month = sprintf '%02d', $month ;
    $date = $year.q{-}.$month;

    print "$date-01 "
  }
}

# Record latest date
if ($date) {
  open my $latout, '>', 'latest' or die $ERRNO;
  print $latout $date;
  close $latout or die $ERRNO;
}
