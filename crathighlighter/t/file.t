#!/usr/bin/env perl
# Test wikipage processing

use strict;
use warnings;
use diagnostics;

use English;

use File::Slurper qw(read_text write_text);
use JSON;

use Test::More tests => 2;

# List of each group, but for testing right now just a couple
my @rights = qw(bureaucrat interface-admin);
# Real deal
my @buro = ['Acalamari', 'AmandaNP', 'Avraham', 'Bibliomaniac15', 'Cecropia', 'Deskana', 'Dweller', 'MBisanz', 'Maxim', 'Nihonjoe', 'Primefac', 'SilkTork', 'UninvitedCompany', 'Useight', 'Warofdreams', 'WereSpielChequers', 'Worm That Turned', 'Xaosflux', 'Xeno'];
my @inta = ['Amorymeltzer', 'Cyberpower678', 'Enterprisey', 'Evad37', 'Izno', 'MusikAnimal', 'MusikBot II', 'Oshwah', 'Ragesoss', 'Writ Keeper', 'Xaosflux'];
my %actual = ('bureaucrat' => @buro, 'interface-admin' => @inta);

# Template for generating JSON, sorted
my $jsonTemplate = JSON->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish

my $file = 't/file.json';
my $fileJSON = read_text($file) or die $ERRNO;

my $contentReturn = $jsonTemplate->decode($fileJSON);
# Stores page title, content, and last edited time in an array for each group
my %contentData;
# This monstrosity results in an array where each item is an array of hashes:
## title     -> used to also snag the specific group used for hash key
## revisions -> array containing one item, which is a hash, which has keys:
### content   -> full page content
### timestamp -> time last edited
# Just awful.
my @pages = @{${${$contentReturn}{query}}{pages}};
foreach my $i (0..scalar @pages - 1) {
  my %page = %{$pages[$i]};
  my $userGroup = $page{title} =~ s/.*\.js\/(.+)\.json/$1/r;
  my @revisions = @{$page{revisions}};
  $contentData{$userGroup} = [$page{title},${$revisions[0]}{content},${$revisions[0]}{timestamp}];
}

foreach my $userGroup (@rights) {
  my $userHashRef = $jsonTemplate->decode($contentData{$userGroup}[1]);
  my @users = sort keys %{$userHashRef};
  is_deeply(\@users, \@{$actual{$userGroup}}, $userGroup);
}
