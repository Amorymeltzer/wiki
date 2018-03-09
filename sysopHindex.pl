#!/usr/bin/env perl
# sysopHindex.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Interesting value for administrator activity
# Approximate the h-index/Eddington number for admin actions from User:JamesR/AdminStats

use strict;
use warnings;
use diagnostics;

unless (@ARGV == 2)
  {
    print "Usage: $0 <then.txt> <now.txt>\n";
    exit;
  }

my %oldAdmin;
my %newAdmin;
my %final;			# holds the difference
my $count = 0;			# global

# Populate hashes from relevant data source
open my $old, '<', "$ARGV[0]" or die $!;
while (<$old>) {
  my @array = basicFormat($_);
  next if $array[0] =~ m/^User$|^Totals$/o;
  next if $array[0] =~ m/[bB]ot$/o;
  $oldAdmin{$array[0]} = $array[-1];
}
close $old or die $!;

open my $new, '<', "$ARGV[1]" or die $!;
while (<$new>) {
  my @array = basicFormat($_);
  next if $array[0] =~ m/^User$|^Totals$/o;
  next if $array[0] =~ m/[bB]ot$/o;
  $newAdmin{$array[0]} = $array[-1];
}
close $new or die $!;


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


sub basicFormat
  {
    my ($line) = @_;
    chomp $line;
    #    $line =~ s/\"//g; #names with commas are exported in quotes by excel
    my @array = split /\t/, $line;
    return @array;
  }
