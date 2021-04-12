#!/usr/bin/env perl
# cleanRaw.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Tidy data so checksums don't change

use strict;
use warnings;
use diagnostics;

my $line = 0;
my $skip = 0;
my $file = shift;
open my $data, '<', "$file" or die $!;
while (<$data>) {
  next if $line == $.;
  # Skip language links, they're subject to change
  if ($skip == 1) {
    if (/<\/div>/) {
      $skip = 0;
    }
    next if $skip == 1;
  } else {
    if (/div class="lang-group btn-group dropdown"/) {
      $skip = 1;
    }
  }
  # Skip replag notice if present
  if (/class="alert alert-warning alert-dismissable xt-alert"/) {
    $line = $.+6;
    next;
  }
  # Footer has quotes, other variable content
  if (/footer class="app-footer container-fluid"/) {
    last;
  }
  print "$_";
}
close $data or die $!;
