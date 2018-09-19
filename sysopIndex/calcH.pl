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
if (@ARGV != 3) {
  print "Usage: $PROGRAM_NAME <opt> <output> <directory>\n";
  print "all:\t Calculate S-index month-to-month (equivalent to roll1)\n";
  print "roll#:\t Calculate rolling S-index (e.g., roll3 for a 3-month count)\n";
  # print "year:\t Calculate H-index for each annual period\n";
  # print "quarter: Calculate H-index for each quarterly period\n";
  # print "finance: Calculate H-index for each fiscal quarter\n";
  exit;
}

my $output = $ARGV[1];
opendir my $dir, "$ARGV[2]" or die $ERRNO;
my @files = readdir $dir;
closedir $dir or die $ERRNO;
splice @files, 0, 2;		# Remove dot directories

# my ($firstYear,$firstMonth) = (split /-/, $files[0])[0,1];
# my ($lastYear,$lastMonth) = (split /-/, $files[-1])[0,1];

# print "$firstYear-$firstMonth\n$lastYear-$lastMonth\n";

if ($ARGV[0] =~ m/all/i) {
  print "--All--\n";
  main(1, \@files);
} elsif ($ARGV[0] =~ m/roll\d+/i) {
  $ARGV[0] =~ s/roll(\d+)/$1/;
  print "--Rolling $ARGV[0]--\n";
  main($ARGV[0], \@files);
}


# Workhorses
sub main {
  my ($pin,$filesRef) = @_;
  open my $outF, '>', "$output" or die $ERRNO;
  print $outF "Month,S-Index,Total,S-Index+bot,Total+bot\n";
  # foreach my $file (@{$filesRef}) {
  foreach my $fileN (0..scalar @{$filesRef}-1) {
    next if $fileN < $pin-1;
    print $outF (split /\./, ${$filesRef}[$fileN])[0].q{,};

    my @passFile = @{$filesRef}[$fileN-$pin+1..$fileN];
    foreach my $loc (0..scalar @passFile-1) {
      $passFile[$loc] = $ARGV[2].$passFile[$loc];
    }

    print "Processing $passFile[0]\n";
    my $out = `perl sysopHindex.pl @passFile`;
    chomp $out;
    print $outF "$out\n";
  }
  close $outF or die $ERRNO;
  return;
}
