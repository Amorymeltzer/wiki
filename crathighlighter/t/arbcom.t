#!/usr/bin/env perl
# Tests for ArbCom template processing

use strict;
use warnings;
use diagnostics;

use English;

use Test::More;
my @testFiles = ('members.txt', 'members_former.txt', 'members_elect.txt');
my $count = scalar @testFiles;
plan tests => $count;

# Official list compared to testing pages, minor changes to handle sorting
# differences and resignations
my @arbcom = ('Beeblebrox', 'Bradv', 'Casliber', 'DGG', 'David Fuchs', 'GorillaWarfare', 'Joe Roe', 'KrakatoaKatie', 'Maxim', 'Mkdw', 'Newyorkbrad', 'SoWhy', 'Worm That Turned', 'Xeno');

foreach my $file (@testFiles) {
  is_deeply(parseContent("t/$file"), \@arbcom, "$file");
}

# Rough approximation of the processing function in the main script, adapted to
# use local files.
sub parseContent {
  my $fn = shift;
  # Overkill here, but mimic the actual running design
  my %groupsData;
  # Return value ignored, we're testing the process with known quantities
  open my $ac, '<', "$fn";
  while (<$ac>) {
    if (/:#\{\{user\|(.*)}}/) {
      $groupsData{arbcom}{$1} = 1;
    }
    # Avoid listing former Arbs or Arbs-elect, which are occasionally found at
    # the bottom of the list during transitionary periods
    last if /<big>/ && !(/\{\{xt\|Active}}/ || /\{\{!xt\|Inactive}}/);
  }
  # As above
  close $ac;

  my @arbs = sort keys %{$groupsData{arbcom}};
  return \@arbs;
}
