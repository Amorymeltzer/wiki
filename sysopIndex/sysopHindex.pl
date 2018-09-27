#!/usr/bin/env perl
# sysopHindex.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# s-index, a potentially interesting value for administrator activity
# Caluclate an h-index/Eddington number-like statistic for admin actions
# Data from XTools AdminStats

use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);

if (@ARGV < 1) {
  print "Usage: $PROGRAM_NAME month.csv <month2.csv month3.csv ...>\n";
  exit;
}

# Populate initial hashes
my (%oldAdmin,%oldAdminBot);
buildArray($ARGV[0],\%oldAdmin,\%oldAdminBot);
# Combine data from each subsequent file
foreach my $num (1..scalar @ARGV - 1) {
  my (%newAdmin,%newAdminBot);
  buildArray($ARGV[$num],\%newAdmin,\%newAdminBot);
  mergeData(\%oldAdmin,\%newAdmin);
  mergeData(\%oldAdminBot,\%newAdminBot);
}

# Calculate the score
my ($count,$total) = calcIndex(\%oldAdmin);
my ($countBot,$totalBot) = calcIndex(\%oldAdminBot);
print "$countBot,$totalBot,$count,$total\n";


# Subroutines
sub buildArray {
  my ($file,$hashRef,$hashRefBot) = @_;
  open my $data, '<', "$file" or die $ERRNO;
  while (<$data>) {
    # Column names not needed, but nice to have in the input files
    next if $NR == 1;
    chomp;
    my @array = split /,/;
    # next if ($array[0] =~ m/\(WMF\)/io); # Remove WMF staff members, minor changes
    ${$hashRefBot}{$array[0]} = $array[-1];
    next if ($array[0] =~ m/bot\b/io);
    ${$hashRef}{$array[0]} = $array[-1];
  }
  close $data or die $ERRNO;
  return;
}

sub mergeData {
  my ($hashRef,$hashRefNew) = @_;
  foreach my $key (keys %{$hashRefNew}) {
    if (${$hashRef}{$key}) {
      ${$hashRef}{$key} += ${$hashRefNew}{$key};
    } else {
      ${$hashRef}{$key} = ${$hashRefNew}{$key};
    }
  }
  return;
}

sub calcIndex {
  my ($hashRef) = @_;
  my @indTot = (0,0);
  #high->low, a->z
  foreach my $key (sort {${$hashRef}{$b} <=> ${$hashRef}{$a} || $a cmp $b} (keys %{$hashRef})) {
    next if ${$hashRef}{$key} == 0;
    $indTot[1] += ${$hashRef}{$key};
    if ($indTot[0] <= ${$hashRef}{$key}) {
      $indTot[0]++;
    }
  }
  return @indTot;
}
