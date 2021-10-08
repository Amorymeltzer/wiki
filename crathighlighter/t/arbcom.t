#!/usr/bin/env perl
# Tests for ArbCom template processing

use strict;
use warnings;
use diagnostics;

use English;

# use Test::More tests => 42;
use Test::More;

# Official list compared to testing pages, minor changes to handle sorting
# differences and resignations
my @arbcom = ('Beeblebrox', 'Bradv', 'Casliber', 'DGG', 'David Fuchs', 'GorillaWarfare', 'Joe Roe', 'KrakatoaKatie', 'Maxim', 'Mkdw', 'Newyorkbrad', 'SoWhy', 'Worm That Turned', 'Xeno');

my @testFiles = ('members.txt', 'members_former.txt', 'members_elect.txt');
foreach my $file (@testFiles) {
  is_deeply(\@arbcom, parseContent("t/$file"), "$file");
}

# Rough approximation of the processing function in the main script, adapted to
# use local files.
sub parseContent {
  my $fn = shift;
  my @arbs;
  open my $ac, '<', "$fn" or die $ERRNO;
  while (<$ac>) {
    if (/:#\{\{user\|(.*)}}/) {
      push @arbs, $1;
    }

    # Avoid listing former Arbs or Arbs-elect, which are occasionally found at
    # the bottom of the list during transitionary periods
    last if /<big>/ && !(/\{\{xt\|Active}}/ || /\{\{!xt\|Inactive}}/);
  }
  close $ac or die $ERRNO;

  # return (sort @arbs);
  @arbs = sort @arbs;
  return \@arbs;
}


done_testing();
