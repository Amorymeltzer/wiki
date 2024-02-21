#!/usr/bin/env perl
# Tests for ArbCom template processing

use 5.036;

use File::Slurper qw(read_text);

use AmoryBot::CratHighlighter qw (findArbComMembers);
use Test::More;
use Test::Fatal;

my @testFiles = ('arbcom_members.txt', 'arbcom_members_former.txt', 'arbcom_members_elect.txt', 'arbcom_members_old.txt', 'arbcom_members_former_old.txt', 'arbcom_members_elect_old.txt');
plan tests => 1 + scalar @testFiles;

# Bad data
like(exception {findArbComMembers()}, qr/Missing data/, 'No data');

# Official list compared to testing pages, minor changes to handle sorting
# differences and resignations
my @arbcom = ('Barkeep49', 'Beeblebrox', 'Cabayi', 'CaptainEek', 'Enterprisey', 'GeneralNotability', 'Guerillero', 'Izno', 'L235', 'Moneytrees', 'Opabinia regalis', 'Primefac', 'SilkTork', 'Wugapodes');

foreach my $file (@testFiles) {
  # This could be made even simpler by just using a direct reference and not
  # bothering with the hash, but this mimics the actual running design.
  my %groupsData;
  $groupsData{arbcom} = findArbComMembers(read_text("t/$file"));

  my @users = sort keys %{$groupsData{arbcom}};
  is_deeply(\@users, \@arbcom, "$file");
}
