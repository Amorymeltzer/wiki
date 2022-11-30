#!/usr/bin/env perl
# Tests for ArbCom template processing

use strict;
use warnings;
use diagnostics;

use English;

use File::Slurper qw(read_text);

use Test::More;
my @testFiles = ('arbcom_members.txt', 'arbcom_members_former.txt', 'arbcom_members_elect.txt');
my $count = scalar @testFiles;
plan tests => $count;

# Official list compared to testing pages, minor changes to handle sorting
# differences and resignations
my @arbcom = ('Beeblebrox', 'Bradv', 'Casliber', 'DGG', 'David Fuchs', 'GorillaWarfare', 'Joe Roe', 'KrakatoaKatie', 'Maxim', 'Mkdw', 'Newyorkbrad', 'SoWhy', 'Worm That Turned', 'Xeno');

# foreach my $file (@testFiles) {
#   is_deeply(parseContent("t/$file"), \@arbcom, "$file");
# }

foreach my $file (@testFiles) {
  $file = "t/$file";
  # Overkill here, but mimic the actual running design
  my %groupsData;
  my $acMembers = read_text($file);

  findArbComMembers($acMembers, \%groupsData);
  my @users = sort keys %{$groupsData{arbcom}};
  is_deeply(\@users, \@arbcom, "$file");
}


# Proccess each line of the page content to get the users listed
# This could be smarter, since it's *only* doing arbcom, maybe it could just
# return the {arbcom} hash data, which gets assigned to %groupsData{arbcom}?
# FIXME TODO
sub findArbComMembers {
  my ($fh, $dataHashRef) = @_;	# Rename fh FIXME TODO

  for (split /^/, $fh) {
    if (/:#\{\{user\|(.*)}}/) {
      ${$dataHashRef}{arbcom}{$1} = 1;
    }
    # Avoid listing former Arbs or Arbs-elect, which are occasionally found at
    # the bottom of the list during transitionary periods
    last if /<big>/ && !(/\{\{xt\|Active}}/ || /\{\{!xt\|Inactive}}/);
  }
}
