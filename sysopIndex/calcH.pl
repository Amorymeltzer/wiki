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
splice @files, 0, 2;		# Remove dot directories
print "@files\n";

my ($firstYear,$firstMonth) = (split /-/, $files[0])[0,1];
my ($lastYear,$lastMonth) = (split /-/, $files[-1])[0,1];

print "$firstYear,$firstMonth\n$lastYear,$lastMonth\n";

if ($ARGV[0] =~ m/all/i) {
  print "All\n\n";
  all(\@files);
}


# Workhorses
sub all
  {
    my ($filesRef) = @_;
    open my $outF, '>', 'sindex.csv' or die $ERRNO;
    print $outF "Month,S-Index,S-Index+bot\n";
    foreach my $file (@{$filesRef}) {
      # my $date = (split /\./, $file)[0].q{,};
      # print $outF (split /\./, $file)[0].q{,};
      my $date = (split /\./, $file)[0];
      $date = join q{-}, (split /-/, $date)[0,1];
      print $outF $date.q{,};

      print "$ARGV[1]$file\n";

      my $out = `perl sysopHindex.pl $ARGV[1]$file`;
      chomp $out;
      print $outF "$out,";

      $out = `perl sysopHindex.pl bot $ARGV[1]$file`;
      chomp $out;
      print $outF "$out\n";
    }
    close $outF or die $ERRNO;
    return;
  }
