#!/usr/bin/env perl
# procjson.pl by Amory Meltzer

use strict;
use warnings;
use diagnostics;

my (%store,%catL);
my @cats;
my @levels = qw(1 2 3 4 4im);
my ($uw, $lvl, $lt) = (q{},q{},0);
my $cat = q{};

open my $in, '<', "$ARGV[0]" or die $1;
while (my $l = <$in>) {
  chomp $l;
  if ($l =~ /^\t\t\t"(uw-.+)(\d(?:im)?)": \{/) { # Level template
    ($uw,$lvl,$lt) = ($1,$2,$.);
    push @{$catL{$cat}}, $uw;
  } elsif ($l =~ /^\t\t"(.+)": \{/) { # Category
    $cat = $1;
    push @cats, $cat;
  } elsif ($. == $lt+1) { # label
    $store{$cat}{$uw}{$lvl}{label} = $l;
  } elsif ($. == $lt+2) { # summary
    $store{$cat}{$uw}{$lvl}{summary} = $l;
  }
}
close $in or die $1;

# use Data::Dumper;
# print Dumper(%store);

# Uniqify
my %seen;
@cats = grep !$seen{$_}++, @cats;

# process outfile
open my $out, '>', 'out.json' or die $1;
print $out "\tlevels: {\n";
foreach my $group (@cats) {
  print $out "\t\t\"$group\": {\n";
  # Uniqify
  my %seen2;
  @{$catL{$group}} = grep !$seen{$_}++, @{$catL{$group}};
  foreach my $temp (@{$catL{$group}}) {
    print $out "\t\t\t\"$temp\": {\n";
    foreach my $level (@levels) {
      if ($store{$group}{$temp}{$level}) {
	print $out "\t\t\t\tlevel$level: {\n";
	print $out "\t$store{$group}{$temp}{$level}{label}\n";
	print $out "\t$store{$group}{$temp}{$level}{summary}\n";
	print $out "\t\t\t\t},\n";
      }
    }
    print $out "\t\t\t},\n";
  }
  print $out "\t\t},";
}
print $out '},\n';
close $out or die $1;
