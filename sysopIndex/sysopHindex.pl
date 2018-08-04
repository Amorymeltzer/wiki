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
my %newAdmin;
my $count = 0;			# global

# Populate hashes from relevant data source
parseFile($ARGV[0],\%oldAdmin);

foreach my $num (1..scalar @ARGV - 1) {
  print "$num\t$ARGV[$num]\n";
  parseFile($ARGV[$num],\%newAdmin);

  # Add latest data
  foreach my $key (keys %newAdmin) {
    if ($oldAdmin{$key}) {
      $oldAdmin{$key} += $newAdmin{$key};
    } else {
      $oldAdmin{$key} = $newAdmin{$key};
    }
  }
}

# Debug, to try to find user renames
# Can also just reverse dates, anyone who shows got renamed
#    elsif ($newAdmin{$key} > 50)
#    {
#	print "$key\t$newAdmin{$key}\n";
#    }


# Calculate the score
foreach my $key (sort {$oldAdmin{$b} <=> $oldAdmin{$a} || $a cmp $b} (keys %oldAdmin)) #high->low, a->z
  {
    next if $oldAdmin{$key} == 0;
    last if $count > $oldAdmin{$key};
    $count++;
    print "$oldAdmin{$key}\t$key\t$count\n"; # sorted actions until h-index
  }

#  print "Sysop H-index:\t$count\n";
print "$count\n";


sub parseFile
  {
    my ($file,$hashRef) = @_;
    open my $data, '<', "$file" or die $ERRNO;
    while (<$data>) {
      # Column names not needed, but nice to have in the input files
      next if $NR == 1;
      chomp;
      my @array = split /,/;
      next if $array[0] =~ m/[bB]ot$/o;
      ${$hashRef}{$array[0]} = $array[-1];
    }
    close $data or die $ERRNO;
    return;
  }
