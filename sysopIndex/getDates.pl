#!/usr/bin/env perl
# getDates.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Figure out which dates we need to download
## Data starts September 2008 (could do August, but meh)


use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);

# Log entries start around 12/23/04, so start with '05
my ($startYear,$startMonth) = (2004,12);
# 0-indexed
my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime;
# Not anymore!
$mon++;
# 1900-indexed
my $endYear = $year+1900;

# Date of last data grab
if (@ARGV && $ARGV[0] ne 'initialize') {
  ($startYear,$startMonth) = split /-/, $ARGV[0];
}


# Process dates, grab data
my $date;
for my $year (($startYear..$endYear)) {
  for my $month (1..12) {
    # Don't start too early
    next if ($year == $startYear && $month <= $startMonth);
    # Don't count this month
    next if ($year == $endYear && $month > $mon - 1);

    # Days in the month
    my $day = 31;
    if ($month =~ /[4|6|9|11]/) {
      $day--;
    } elsif ($month eq '2') {
      $day = 28;
      if ($year % 4 == 0 && ($year % 100 != 0 || $year % 400 == 0)) {
	$day++;
      }
    }
    $month = sprintf '%02d', $month;
    $date = $year.q{-}.$month;

    print "$date-01/$date-$day "
  }
  if ($year eq $endYear) {
    # Record latest date
    if ($date) {
      open my $latout, '>', 'latest' or die $ERRNO;
      print $latout $date;
      close $latout or die $ERRNO;
    }
  }
}
