#!/usr/bin/env perl
# getData.pl by Amory Meltzer
# Bulk download data monthly data from [[User:JamesR/AdminStats]]
## Starts September 2008 (could do August, but meh)
## Should check timestamps to confirm data quality
## Make sure don't surpass this month of this year?


use strict;
use warnings;
use diagnostics;

my $startYear = 2008;
# 0-indexed
my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime;
# Not anymore!
$mon++;
# 1900-indexed
my $endYear = $year+1900;

for my $year (($startYear..$endYear)) {
  for my $month (1..12) {
    next if ($year == $startYear && $month < 9);
    next if ($year == $endYear && $month > $mon);
    $month = sprintf("%02d", $month);
    my $date = $year.'-'.$month.'-01';
    print "$date\n";
  }
}
