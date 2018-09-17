#!/usr/bin/env perl
# sysopHindex.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Interesting value for administrator activity
# Approximate the h-index/Eddington number for admin actions using
# XTools AdminStats

## Probably need more efficient index calculation


use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);

if (@ARGV < 1) {
  print "Usage: $PROGRAM_NAME month.csv <month2.csv month3.csv ...>\n";
  exit;
}

my %oldAdmin;
my %oldAdminBot;
my ($count,$total) = (0,0);
my ($countBot,$totalBot) = (0,0);

# Populate hashes from relevant data source
parseFile($ARGV[0],\%oldAdmin,\%oldAdminBot);

foreach my $num (1..scalar @ARGV - 1) {
  # print "$num\t$ARGV[$num]\n";
  my (%newAdmin,%newAdminBot);
  parseFile($ARGV[$num],\%newAdmin,\%newAdminBot);

  # Add latest data
  foreach my $key (keys %newAdmin) {
    if ($oldAdmin{$key}) {
      $oldAdmin{$key} += $newAdmin{$key};
    } else {
      $oldAdmin{$key} = $newAdmin{$key};
    }
  }
  foreach my $key (keys %newAdminBot) {
    if ($oldAdminBot{$key}) {
      $oldAdminBot{$key} += $newAdminBot{$key};
    } else {
      $oldAdminBot{$key} = $newAdminBot{$key};
    }
  }
}


# Calculate the score
foreach my $key (sort {$oldAdmin{$b} <=> $oldAdmin{$a} || $a cmp $b} (keys %oldAdmin)) #high->low, a->z
  {
    next if $oldAdmin{$key} == 0;
    $total += $oldAdmin{$key};
    if ($count <= $oldAdmin{$key}) {
      $count++;
    }
  }
foreach my $key (sort {$oldAdminBot{$b} <=> $oldAdminBot{$a} || $a cmp $b} (keys %oldAdminBot)) #high->low, a->z
  {
    next if $oldAdminBot{$key} == 0;
    $totalBot += $oldAdminBot{$key};
    if ($countBot <= $oldAdminBot{$key}) {
      $countBot++;
    }
  }

print "$count,$total,$countBot,$totalBot\n";


sub parseFile
  {
    my ($file,$hashRef,$hashRefBot) = @_;
    open my $data, '<', "$file" or die $ERRNO;
    while (<$data>) {
      # Column names not needed, but nice to have in the input files
      next if $NR == 1;
      chomp;
      my @array = split /,/;
      ${$hashRefBot}{$array[0]} = $array[-1];
      next if ($array[0] =~ m/bot\b/io);
      ${$hashRef}{$array[0]} = $array[-1];
    }
    close $data or die $ERRNO;
    return;
  }
