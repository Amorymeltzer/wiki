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

if (@ARGV != 2) {
  print "Usage: $PROGRAM_NAME <then.txt> <now.txt>\n";
  exit;
}

my %oldAdmin;
my %newAdmin;
my %final;			# holds the difference
my $count = 0;			# global

# Populate hashes from relevant data source
parseFile($ARGV[0],\%oldAdmin);
parseFile($ARGV[1],\%newAdmin);


# The difference for each individual sysop aka total log actions for that time period
foreach my $key (sort keys %newAdmin) {
  #    next unless exists $oldAdmin{$key};
  my $act = $newAdmin{$key};
  if (exists $oldAdmin{$key}) {
    $act = $newAdmin{$key}-$oldAdmin{$key};
  }

  # Alternate to above, maybe slower since it ALWAYS does three actions?
  #    my $act = $oldAdmin{$key} // 0;
  #    $act = $newAdmin{$key} - $act;


  #    print "$act\t$key\n"; # log, sysop for sorting
  $final{$key} = $act;


  # Debug, to try to find user renames
  # Can also just reverse dates, anyone who shows got renamed
  #    elsif ($newAdmin{$key} > 50)
  #    {
  #	print "$key\t$newAdmin{$key}\n";
  #    }
}


# Calculate the score
foreach my $key (sort {$final{$b} <=> $final{$a} || $a cmp $b} (keys %final)) #high->low, a->z
  {
    next if $final{$key} == 0;
    last if $count > $final{$key};
    $count++;
    #    print "$final{$key}\t$key\t$count\n"; # sorted actions until h-index
  }

#print "Sysop H-index:\t$count\n";
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
