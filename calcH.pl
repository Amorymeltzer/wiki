#!/usr/bin/env perl
# calcH.pl by Amory Meltzer
# Bulk calculate the sysop H-index for a given period

use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);

# 0-indexed
#  my @years = (2009,2010,2011,2012,2013);
my @years = (2018);
# 1-indexed to make month numbers familiar
my @months = qw (err jan feb mar apr may jun jul aug sep oct nov dec);

# If months/years are referenced as numbers, jumping around is easy
my $yearCount = scalar @years - 1;
my $monthCount = scalar @months - 1;

# $ARGV[0] if defined, empty (so the ifs don't fail) if not
my $which = $ARGV[0] // q{};

if ($which =~ m/all/i) {
  print "All\n\n";
  all();
} elsif ($which =~ m/year/i) {
  print "Year\n\n";
  year();
} elsif ($which =~ m/quarter/i) {
  print "Quarter\n\n";
  quarter();
} elsif ($which =~ m/finance/i) {
  print "Finance\n\n";
  finance();
}

# Usage information
else {
  print "Usage: $0 <opt>\n";
  print "all:\t Calculate H-index for each month\n";
  print "year:\t Calculate H-index for each annual period\n";
  print "quarter: Calculate H-index for each quarterly period\n";
  print "finance: Calculate H-index for each fiscal quarter\n";
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
