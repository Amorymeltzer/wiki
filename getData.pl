#!/usr/bin/env perl
# getData.pl by Amory Meltzer
# Bulk download data monthly data from [[User:JamesR/AdminStats]]
## Data starts September 2008 (could do August, but meh)
## Should check timestamps to confirm data quality


use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);

if (@ARGV != 1) {
  print "Usage: $PROGRAM_NAME <getData.pl> <latest>\n";
  exit;
}

# Earliest reliable data is from Semptember 2008, don't use anything older
my ($startYear,$startMonth) = (2008,8);
# 0-indexed
my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime;
# Not anymore!
$mon++;
# 1900-indexed
my $endYear = $year+1900;

open my $latest, '<', "$ARGV[0]" or croak $ERRNO;
while (<$latest>) {
  chomp;
  if ($_) {
    ($startYear,$startMonth) = split /-/;
  }
}
close $latest or croak $ERRNO;

for my $year (($startYear..$endYear)) {
  for my $month (1..12) {
    next if ($year == $startYear && $month <= $startMonth);
    next if ($year == $endYear && $month > $mon);
    $month = sprintf '%02d', $month ;
    my $date = $year.q{-}.$month.q{-}.'01';
    print "$date\n";
  }
}
