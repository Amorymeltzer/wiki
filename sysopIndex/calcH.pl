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

use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);
use POSIX;

# Usage information
if (@ARGV != 2) {
  print "Usage: $PROGRAM_NAME <opt> <directory>\n";
  print "all:\t Calculate H-index for each month\n";
  print "year:\t Calculate H-index for each annual period\n";
  print "quarter: Calculate H-index for each quarterly period\n";
  print "finance: Calculate H-index for each fiscal quarter\n";
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
my $suf = '-01-01.csv';

###### NON ROLLING OPTIONS ######
### CALENDAR YEAR ###
print "Calendar year\n";
foreach my $year ($firstYear+1..$lastYear-1) {
  my $yearN = $year+1;
  print "$year\t";
  system "perl sysopHindex.pl $ARGV[1]/$year$suf $ARGV[1]/$yearN$suf";
}

### ACADEMIC YEAR ###
print "Academic year\n";
my ($plus,$minus) = (0,0);
if ($firstMonth > 9) {
  $plus++;
}
if ($lastMonth < 9) {
  $minus--;
}
my $aSuf = '-09-01.csv';
foreach my $year ($firstYear+$plus..$lastYear-1+$minus) {
  my $yearN = $year+1;
  print "$year to $yearN\t";
  system "perl sysopHindex.pl $ARGV[1]/$year$aSuf $ARGV[1]/$yearN$aSuf";
}

### QUARTERS ###
print "Quarters\n";
$minus = 0;
if ($lastMonth < 4) {
  $minus--;
}
foreach my $year ($firstYear..$lastYear+$minus) {
  my $start = ceil $firstMonth/3;
  $start--;
  $start *= 3;
  $start++;
  if ($year != $firstYear) {
    $start = 1;
  }
  $start = sprintf '%02d', $start;
  for (my $sm = $start; $sm<=12; $sm+=3) {
    $sm = sprintf '%02d', $sm;
    my $en = '-'.$sm.'-01.csv';
    my $next = $sm+3;
    my $yearN = $year;
    if ($next > 12) {
      $next = 1;
      $yearN++;
    }
    $next = sprintf '%02d', $next;
    my $nen = '-'.$next.'-01.csv';
    print "$sm-$year to $next-$yearN\t";
    system "perl sysopHindex.pl $ARGV[1]/$year$en $ARGV[1]/$yearN$nen";
  }
}

# 0-indexed
my @years = $firstYear..$lastYear;
# 1-indexed to make month numbers familiar
my @months = qw (err jan feb mar apr may jun jul aug sep oct nov dec);
exit;

# If months/years are referenced as numbers, jumping around is easy
my $yearCount = scalar @years - 1;
my $monthCount = scalar @months - 1;

if ($ARGV[0] =~ m/all/i) {
  print "All\n\n";
  all();
} elsif ($ARGV[0] =~ m/year/i) {
  print "Year\n\n";
  year();
} elsif ($ARGV[0] =~ m/quarter/i) {
  print "Quarter\n\n";
  quarter();
} elsif ($ARGV[0] =~ m/finance/i) {
  print "Finance\n\n";
  finance();
} else {
  print "Enter a damn option!\n";
  exit;
}


# Workhorses

sub all
  {
    foreach my $year (0..$yearCount) {
      foreach my $month (1..$monthCount) {
	next if $years[$year] == 2009 && $month < 4; # data starts April 09
	exit if $years[$year] == 2013 && $month > 4; # most recent is May 13

	if ($years[$year] == 2012 && ($month == 3 || $month == 4)) {
	  print "No data for April 2012\n";
	  next;
	}

	my $newM = $month+1;
	my $newY = $year;
	if ($month == 12)	# year-end wraparound
	  {
	    $newM = 1;
	    $newY += 1;
	  }

	print "$months[$month] $years[$year] to $months[$newM] $years[$newY]\t";
	system "perl sysopHindex.pl hIndex_files/$months[$month]$years[$year].txt hIndex_files/$months[$newM]$years[$newY].txt";
      }
    }
    return;
  }


sub year
  {
    foreach my $year (0..$yearCount) {
      foreach my $month (1..$monthCount) {
	next if $years[$year] == 2009 && $month < 4; # data starts April 09
	exit if $years[$year] == 2012 && $month > 5; # most recent is May 13

	if (($years[$year] == 2011 || $years[$year] == 2012) && $month == 4) {
	  print "No data for April 2012\n";
	  next;
	}

	my $newM = $month;
	my $newY = $year+1;

	print "$months[$month] $years[$year] to $months[$newM] $years[$newY]\t";
	system "perl sysopHindex.pl hIndex_files/$months[$month]$years[$year].txt hIndex_files/$months[$newM]$years[$newY].txt";
      }
    }
    return;
  }


sub quarter
  {
    foreach my $year (0..$yearCount) {
      foreach my $month (1..$monthCount) {
	next if $years[$year] == 2009 && $month < 4; # data starts April 09
	exit if $years[$year] == 2013 && $month > 2; # most recent is May 13

	if ($years[$year] == 2012 && ($month == 1 || $month == 4)) {
	  print "No data for April 2012\n";
	  next;
	}

	my $newM = $month+3;
	my $newY = $year;
	if ($month > 9)		# year-end wraparound
	  {
	    $newM = $newM%12;
	    $newY += 1;
	  }

	print "$months[$month] $years[$year] to $months[$newM] $years[$newY]\t";
	system "perl sysopHindex.pl hIndex_files/$months[$month]$years[$year].txt hIndex_files/$months[$newM]$years[$newY].txt";
      }
    }
    return;
  }

sub finance
  {
    foreach my $year (0..$yearCount) {
      foreach my $month (1..$monthCount) {
	#	    next if $month !~ m/^1$|4|7|^10$/;
	# To avoid the no data issue in April 12
	# March chosen to minimize fluctuations due to end-of-year holidays
	next if $month !~ m/3|6|9|^12$/;
	next if $years[$year] == 2009 && $month < 4; # data starts April 09
	exit if $years[$year] == 2013 && $month > 1; # most recent is May 13

	if ($years[$year] == 2012 && ($month == 1 || $month == 4)) {
	  print "No data for April 2012\n";
	  next;
	}

	my $newM = $month+3;
	my $newY = $year;
	if ($month > 9)		# year-end wraparound
	  {
	    $newM = $newM%12;
	    $newY += 1;
	  }

	print "$months[$month] $years[$year] to $months[$newM] $years[$newY]\t";
	system "perl sysopHindex.pl hIndex_files/$months[$month]$years[$year].txt hIndex_files/$months[$newM]$years[$newY].txt";
      }
    }
    return;
  }
