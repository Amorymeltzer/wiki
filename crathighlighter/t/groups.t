#!/usr/bin/env perl
# Test non-ArbCom group processing

use strict;
use warnings;
use diagnostics;

use English;

use File::Slurper qw(read_text write_text);
use JSON::MaybeXS;

use Test::More tests => 2;

# List of each group, but for testing right now just a couple
my @rights = qw(bureaucrat interface-admin);
my $localPerms = join q{|}, @rights;
# Real deal
my @buro = ('Acalamari', 'AmandaNP', 'Avraham', 'Bibliomaniac15', 'Cecropia', 'Deskana', 'Dweller', 'MBisanz', 'Maxim', 'Nihonjoe', 'Primefac', 'SilkTork', 'UninvitedCompany', 'Useight', 'Warofdreams', 'WereSpielChequers', 'Worm That Turned', 'Xaosflux', 'Xeno');
my @inta = ('Amorymeltzer', 'Cyberpower678', 'Enterprisey', 'Evad37', 'Izno', 'MusikAnimal', 'MusikBot II', 'Oshwah', 'Ragesoss', 'Writ Keeper', 'Xaosflux');
my %actual = ('bureaucrat' => \@buro, 'interface-admin' => \@inta);

# Template for generating JSON, sorted
my $jsonTemplate = JSON->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish

my $file = 't/groups.json';
my $fileJSON = read_text($file) or die $ERRNO;

my $groupsReturn = $jsonTemplate->decode($fileJSON);
my %groupsQuery = %{${$groupsReturn}{query}};
my @localHashes = @{$groupsQuery{allusers}};

# Will store hash of editors for each group.  Basically JSON as hash of hashes.
my %groupsData;
foreach my $userHash (@localHashes) {
  # Limit to the groups in question (I always forget how neat grep is), then add
  # that user to the lookup for each group
  # Use map? FIXME TODO
  foreach my $group (grep {/$localPerms/} @{${$userHash}{groups}}) {
    $groupsData{$group}{${$userHash}{name}} = 1;
  }
}

foreach my $userGroup (@rights) {
  my @users = sort keys %{$groupsData{$userGroup}};
  is_deeply(\@users, \@{$actual{$userGroup}}, $userGroup);
}
