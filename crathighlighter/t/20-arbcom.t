#!/usr/bin/env perl
# Tests for ArbCom template processing

use strict;
use warnings;

use English;

use File::Slurper qw(read_text);

use AmoryBot::CratHighlighter qw (findArbComMembers);
use Test::More;

my @testFiles = ('arbcom_members.txt', 'arbcom_members_former.txt', 'arbcom_members_elect.txt');
my $count = scalar @testFiles;
plan tests => $count;

# Official list compared to testing pages, minor changes to handle sorting
# differences and resignations
my @arbcom = ('Beeblebrox', 'Bradv', 'Casliber', 'DGG', 'David Fuchs', 'GorillaWarfare', 'Joe Roe', 'KrakatoaKatie', 'Maxim', 'Mkdw', 'Newyorkbrad', 'SoWhy', 'Worm That Turned', 'Xeno');

foreach my $file (@testFiles) {
  $file = "t/$file";
  # Overkill here, but mimic the actual running design
  my %groupsData;
  my $acMembers = read_text($file);

  findArbComMembers($acMembers, \%groupsData);

  my @users = sort keys %{$groupsData{arbcom}};
  is_deeply(\@users, \@arbcom, "$file");
}
