#!/usr/bin/env perl
# getData.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Bulk download data monthly data from [[User:JamesR/AdminStats]]
## Data starts September 2008 (could do August, but meh)
## Should check timestamps to confirm data quality
## Grab midnight (technically end of last month) or 1AM (start of this month)?


use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);

if (@ARGV != 1) {
  print "Usage: $PROGRAM_NAME <getData.pl> <latest>\n";
  exit;
}

# url format, midnight of new month
my $urlStart = 'https://en.wikipedia.org/w/index.php?title=Special:Export&pages=User:JamesR/AdminStats&offset=';
my $urlEnd = 'T00:00:01Z&limit=1&action=submit';

# Earliest reliable data is from Semptember 2008, don't use anything older
my ($startYear,$startMonth) = (2008,8);
# 0-indexed
my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime;
# Not anymore!
$mon++;
# 1900-indexed
my $endYear = $year+1900;

# Date of last data grab
open my $latest, '<', "$ARGV[0]" or croak $ERRNO;
while (<$latest>) {
  chomp;
  if ($_) {
    ($startYear,$startMonth) = split /-/;
  }
}
close $latest or croak $ERRNO;

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
    print $urlStart."$date-01".$urlEnd;
    print "\n";
  }
}

# Record latest date
if ($date) {
  open my $latout, '>', 'latest' or croak $ERRNO;
  print $latout $date;
  close $latout or croak $ERRNO;
}
