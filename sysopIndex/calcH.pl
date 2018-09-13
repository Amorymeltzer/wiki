#!/usr/bin/env perl
# calcH.pl by Amory Meltzer
# Bulk calculate the sysop H-index for a given period
## Need to add -r option to allow for rolling
## Maybe just make the usage below an option as well???
## Need to figure out first and last year/months from @files
## Take that, process for rolling
## For non-rolling, can determine when to start:
## year: +1 year; quarter/fin/acad: sub to find next start of quarter
## Or maybe just do ALL and pick later?
## Nah just completely revamp this:
## n-month rolling average (1-24, maybe show 1, 3, 6, 12 above the fold)
## Below show hard limits
## calendar year, acad year, quarter, financial

## Rolling average just long list of everything, maybe add option to limit to
## last X number of years/months

use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);

# Usage information
if (@ARGV != 2) {
  print "Usage: $PROGRAM_NAME <opt> <directory>\n";
  print "all:\t Calculate H-index month-to-month\n";
  # print "year:\t Calculate H-index for each annual period\n";
  # print "quarter: Calculate H-index for each quarterly period\n";
  # print "finance: Calculate H-index for each fiscal quarter\n";
  exit;
}

opendir my $dir, "$ARGV[1]" or die $ERRNO;
my @files = readdir $dir;
closedir $dir or die $ERRNO;
splice @files, 0, 2;		# Remove dots
print "@files\n";

my ($firstYear,$firstMonth) = (split /-/, $files[0])[0,1];
my ($lastYear,$lastMonth) = (split /-/, $files[-1])[0,1];

print "$firstYear,$firstMonth\n$lastYear,$lastMonth\n";

# 0-indexed
my @years = $firstYear..$lastYear;
# 1-indexed to make month numbers familiar
my @months = qw (err jan feb mar apr may jun jul aug sep oct nov dec);


# If months/years are referenced as numbers, jumping around is easy
my $yearCount = scalar @years - 1;
my $monthCount = scalar @months - 1;

if ($ARGV[0] =~ m/all/i) {
  print "All\n\n";
  all();
}


# Workhorses

sub all
  {
    open my $outF, '>', 'sindex.csv' or die $ERRNO;
    print $outF "month,sindex,sindex-nobot\n";
    foreach my $year (0..$yearCount) {
      foreach my $month (1..$monthCount) {
	next if $years[$year] == 2017 && $month < 11; # data starts April 09
	exit if $years[$year] == 2018 && $month > 2;  # most recent is May 13

	if ($years[$year] == 2012 && ($month == 3 || $month == 4)) {
	  print "No data for April 2012\n";
	  next;
	}
	# Leading zeroes, for now anyway
	$month = sprintf '%02d', $month;

	print "$months[$month] $years[$year]\t";
	print $outF "$years[$year]-$month,";

	print "\n\nperl sysopHindex.pl $ARGV[1]$years[$year]-$month.csv\n\n";
	`perl sysopHindex.pl $ARGV[1]$years[$year]-$month.csv`;
	my $out = `perl sysopHindex.pl $ARGV[1]$years[$year]-$month.csv`;
	chomp $out;
	print $outF "$out,";

	`perl sysopHindex.pl bot $ARGV[1]$years[$year]-$month.csv`;
	$out = `perl sysopHindex.pl bot $ARGV[1]$years[$year]-$month.csv`;
	chomp $out;
	print $outF "$out\n";
      }
    }
    close $outF or die $ERRNO;
    return;
  }
