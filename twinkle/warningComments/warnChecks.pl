#!/usr/bin/env perl
# warnChecks.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Check and compare hidden comments in warnings used by Twinkle

use strict;
use warnings;
use diagnostics;

use URI::Escape;

# Get current warnings in Twinkle
my $twUrl = 'https://raw.githubusercontent.com/azatoth/twinkle/master/modules/twinklewarn.js';
my $twRaw = `curl -s "$twUrl"`;
my (%singletList, @singletList);
my (%levelList, @levelList);
my $notices = 0;
foreach (split /\n/, $twRaw) {
  if ($notices == 0) {
    if (/'(uw-.+?)\b'/ && !$levelList{$1}) {
      for (1..4) {
	push @levelList, $1.$_;
      }
      push @levelList, $1.'4im';
      $levelList{$1} = 1;
    }
    if (/singlenotice: \{/) {
      $notices++;
      next;
    }
  } else {
    if (/'(uw-.+?)\b'/ && !$singletList{$1}) {
      push @singletList, $1;
      $singletList{$1} = 1;
    }

  }
}

# list
open my $levelOut, '>', 'levelEditLinks' or die $1;
open my $levelCompare, '>', 'levelCompareComments' or die $1;
foreach my $temp (@levelList) {
  my $escaped = uri_escape($temp);
  my $warnUrl = "https://en.wikipedia.org/w/index.php?title=Template:$escaped&action=raw";
  my $warnRaw = `curl -s "$warnUrl"`;

  # Skip (weird) 404 for pages that don't exist
  next if $warnRaw =~ /<!DOCTYPE html>/;

  # Remove the ones that (correctly) redirect
  next if $warnRaw =~ /#REDIRECT ?\[\[Template:Uw-generic\d\]\]/i;

  my $comment = $warnRaw =~ s/.*<!-- Template:(uw-.+?) -->.*/$1/girms;

  if ($comment && $temp ne $comment) {
    print $levelOut "*{{edit|1=Template:$temp|2=$temp}}\n";
    print $levelCompare "$temp: $comment\n";
  }
}
close $levelOut or die $1;
close $levelCompare or die $1;

open my $singletOut, '>', 'singletEditLinks' or die $1;
open my $singletCompare, '>', 'singletCompareComments' or die $1;
foreach my $temp (@singletList) {
  # Mainly uw-c&pmove
  my $escaped = uri_escape($temp);
  my $warnUrl = "https://en.wikipedia.org/w/index.php?title=Template:$escaped&action=raw";
  my $warnRaw = `curl -s "$warnUrl"`;

  my $comment = $warnRaw =~ s/.*<!-- Template:(uw-.+?) -->.*/$1/girms;

  if ($temp ne $comment) {
    print $singletOut "*{{edit|1=Template:$temp|2=$temp}}\n";
    print $singletCompare "$temp: $comment\n";
  }
}
close $singletOut or die $1;
close $singletCompare or die $1;
