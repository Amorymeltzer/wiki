#!/usr/bin/env perl
# Test non-ArbCom group processing

use strict;
use warnings;

use File::Slurper qw(read_text);
use JSON::MaybeXS;

use Test::More tests => 3;

# List of each group, but for testing right now just a couple
my @rights = qw(bureaucrat interface-admin suppress);
my $localPerms = join q{|}, @rights;
# Real deal
my @buro = ('Acalamari', 'AmandaNP', 'Avraham', 'Bibliomaniac15', 'Cecropia', 'Deskana', 'Dweller', 'MBisanz', 'Maxim', 'Nihonjoe', 'Primefac', 'SilkTork', 'UninvitedCompany', 'Useight', 'Warofdreams', 'WereSpielChequers', 'Worm That Turned', 'Xaosflux', 'Xeno');
my @inta = ('Amorymeltzer', 'Cyberpower678', 'Enterprisey', 'Evad37', 'Izno', 'MusikAnimal', 'MusikBot II', 'Oshwah', 'Ragesoss', 'Writ Keeper', 'Xaosflux');
my @over = ('AmandaNP', 'Amorymeltzer', 'Dweller', 'Maxim', 'Oshwah', 'Primefac', 'Worm That Turned', 'Xaosflux');
my %actual = ('bureaucrat' => \@buro, 'interface-admin' => \@inta, 'oversight' => \@over);

# Template for generating JSON, sorted
my $jsonTemplate = JSON->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish

my $file = 't/groups.json';
my $fileJSON = read_text($file);

my $groupsReturn = $jsonTemplate->decode($fileJSON);
my %groupsQuery = %{${$groupsReturn}{query}};
my @localHashes = @{$groupsQuery{allusers}};

# Will store hash of editors for each group.  Basically JSON as hash of hashes.
my %groupsData;
findLocalGroupMembers(\@localHashes, $localPerms, \%groupsData);

foreach my $userGroup (@rights) {
  my @users = sort keys %{$groupsData{$userGroup}};
  is_deeply(\@users, \@{$actual{$userGroup}}, $userGroup);
}



# Loop through each user's data and figure out what groups they've got.  Far
# from perfect; ideally I wouldn't use the @localHashes/$localData, but until
# I stop overwriting data on the continue, then it's a necessary hack
sub findLocalGroupMembers {
  my ($localData, $localRE, $dataHashRef) = @_;

  foreach my $userHash (@{$localData}) {
    # Limit to the groups in question (I always forget how neat grep is), then add
    # that user to the lookup for each group
    # Use map? FIXME TODO
    my @groups = grep {/$localRE/} @{${$userHash}{groups}};
    # Rename suppress to oversight, sigh
    s/suppress/oversight/ for @groups;

    foreach my $group (@groups) {
      ${$dataHashRef}{$group}{${$userHash}{name}} = 1;
    }
  }
}
