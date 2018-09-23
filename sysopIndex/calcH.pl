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

if ($ARGV[0] =~ m/all|^roll1$/i) {
  print "--All--\n";
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
}


# Subroutines
sub helpMenu {
  print "Usage: $PROGRAM_NAME <opt> <output> <directory>\n";
  print "all:\t Calculate s-index month-to-month (equivalent to roll1)\n";
  print "roll#:\t Calculate rolling s-index (e.g., roll3 for a 3-month count)\n";
  print "year:\t Calculate annual s-index\n";
  # print "quarter: Calculate H-index for each quarterly period\n";
  # print "finance: Calculate H-index for each fiscal quarter\n";
  exit 1;
}

sub main {
  my ($roll,$filesRef,$pin) = @_;
  open my $outF, '>', "$ARGV[1]" or die $ERRNO;

  if ($roll eq 'roll') {
    print $outF 'Month,';
  } elsif ($roll eq 'fixed') {
    print $outF 'Year,';
  }
  print $outF "s-index,Total,s-index+nobot,Total+nobot\n";

  foreach my $fileN (0..scalar @{$filesRef}-1) {
    if (($fileN < $pin-1 && $roll eq 'roll') # Skip until enough for rolling
	|| $roll eq 'fixed' && $fileN % $pin != $pin-1) { # Skip until full year
      next;
    }

    my $item = (split /\.|\//, ${$filesRef}[$fileN])[1];
    $item =~ s/-\d\d// if $roll eq 'fixed'; # No month for annual items
    print $outF $item.q{,};

    my @passFile = @{$filesRef}[$fileN-$pin+1..$fileN];

    print "Processing $passFile[0]\n";
    my $out = `perl sysopHindex.pl @passFile`;
    chomp $out;
    print $outF "$out\n";
  }
  close $outF or die $ERRNO;
  return;
}
