#!/usr/bin/env perl
# calcH.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Bulk calculate s-index for a given directory

use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);

# Usage information
if (@ARGV != 3) {
  helpMenu();
}

opendir my $dir, "$ARGV[2]" or die $ERRNO;
my @files = grep {-f "$ARGV[2]/$_" } readdir $dir; # No dots
closedir $dir or die $ERRNO;

# Prepend directory name for full location as this will be passed on
foreach my $loc (0..scalar @files-1) {
  $files[$loc] = $ARGV[2].$files[$loc];
}

if ($ARGV[0] =~ m/month|^roll1$/i) {
  print "--Monthly--\n";
  main('roll', \@files, 1);
} elsif ($ARGV[0] =~ m/roll\d+/i) {
  $ARGV[0] =~ s/roll(\d+)/$1/;
  print "--Rolling $ARGV[0]--\n";
  main('roll', \@files,$ARGV[0]);
} elsif ($ARGV[0] =~ m/year/i) {
  # Find the first January and last december
  shift @files until $files[0] =~ /\d{4}-01\.csv/;
  pop @files until $files[-1] =~ /\d{4}-12\.csv/;
  print "--Annual--\n";
  main('fixed',\@files,12);
} elsif ($ARGV[0] =~ m/academic/i) {
  # Find the first September and last August
  shift @files until $files[0] =~ /\d{4}-09\.csv/;
  pop @files until $files[-1] =~ /\d{4}-08\.csv/;
  print "--Academic--\n";
  main('offcal',\@files,12);
}


# Subroutines
sub helpMenu {
  print "Usage: $PROGRAM_NAME <opt> <output> <directory>\n";
  print "month:\t\t Calculate month-to-month s-index (equivalent to roll1)\n";
  print "roll#:\t\t Calculate rolling s-index (e.g., roll3 for a 3-month count)\n";
  print "year:\t\t Calculate annual s-index\n";
  print "academic:\t Calculate s-index for each academic year (Sep-Aug)\n";
  # print "quarter: Calculate quarterly s-index\n";
  exit 1;
}

sub main {
  my ($roll,$filesRef,$pin) = @_;
  open my $outF, '>', "$ARGV[1]" or die $ERRNO;

  if ($roll eq 'roll') {
    print $outF 'Month,';
  } elsif ($roll eq 'fixed') {
    print $outF 'Year,';
  } elsif ($roll eq 'offcal') {
    print $outF 'Academic year,';
  }
  print $outF "s-index,Total,s-index+nobot,Total+nobot\n";

  foreach my $fileN (0..scalar @{$filesRef}-1) {
    if (($fileN < $pin-1 && $roll eq 'roll') # Skip until enough for rolling
	|| ($roll eq 'fixed' || $roll eq 'offcal') && $fileN % $pin != $pin-1) { # Skip until full year
      next;
    }

    my @passFile = @{$filesRef}[$fileN-$pin+1..$fileN];
    #print "@passFile\n";

    my $item;
    if ($roll eq 'roll') {
      $item = $passFile[-1];
    } elsif ($roll eq 'fixed' || $roll eq 'offcal') {
      $item = $passFile[0];
    }
    # my $item = (split /\.|\//, ${$filesRef}[$fileN])[1];
    $item = (split /\.|\//, $item)[1];
    $item =~ s/-\d\d// if $roll eq 'fixed'; # No month for annual items
    print $outF $item.q{,};




    print "Processing $passFile[0]\n";
    my $out = `perl sysopHindex.pl @passFile`;
    chomp $out;
    print $outF "$out\n";
  }
  close $outF or die $ERRNO;
  return;
}
