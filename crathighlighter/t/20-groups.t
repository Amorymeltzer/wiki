#!/usr/bin/env perl
# Test non-ArbCom group processing

use strict;
use warnings;

use utf8; # Alaa friendly

use File::Slurper qw(read_text);
use JSON::MaybeXS;

use AmoryBot::CratHighlighter qw (findStewardMembers findLocalGroupMembers);
use Test::More;

# List of each group, different from main script in that steward is included
# right off the bat, since we're not using this to build the query
my @rights = qw (bureaucrat suppress checkuser interface-admin sysop steward);
# [] used to create array references from the jump
my %actual = (
	      'bureaucrat' => ['Acalamari', 'AmandaNP', 'Avraham', 'Bibliomaniac15', 'Cecropia', 'Deskana', 'Dweller', 'MBisanz', 'Maxim', 'Nihonjoe', 'Primefac', 'SilkTork', 'UninvitedCompany', 'Useight', 'Warofdreams', 'WereSpielChequers', 'Worm That Turned', 'Xaosflux', 'Xeno'],
	      # Note that this needs to be oversight, not suppress, since
	      # findLocalGroupMembers rewrites the group name of suppress to the
	      # old name used for the on-wiki page, oversight
	      'oversight' => ['AmandaNP', 'Amorymeltzer', 'Dweller', 'Maxim', 'Oshwah', 'Primefac', 'Worm That Turned', 'Xaosflux'],
	      'checkuser' => ['AmandaNP', 'Maxim', 'MusikAnimal', 'Oshwah', 'Primefac', 'Worm That Turned'],
	      'interface-admin' => ['Amorymeltzer', 'Cyberpower678', 'Enterprisey', 'Evad37', 'Izno', 'MusikAnimal', 'MusikBot II', 'Oshwah', 'Ragesoss', 'Writ Keeper', 'Xaosflux'],
	      'sysop' => ['Acalamari', 'AmandaNP', 'Amortias', 'Amorymeltzer', 'Avraham', 'AzaToth', 'Bibliomaniac15', 'Bishonen', 'Cecropia', 'Cyberpower678', 'Deskana', 'Dweller', 'Enterprisey', 'Evad37', 'Izno', 'MBisanz', 'Maxim', 'MusikAnimal', 'MusikBot II', 'Nihonjoe', 'Oshwah', 'Primefac', 'Ragesoss', 'SilkTork', 'UninvitedCompany', 'Useight', 'Warofdreams', 'WereSpielChequers', 'Worm That Turned', 'Writ Keeper', 'Xaosflux', 'Xeno'],
	      'steward' => ['-revi', 'AmandaNP', 'AntiCompositeNumber', 'BRPever', 'Base', 'Bsadowski1', 'Cromium', 'Defender', 'DerHexer', 'HakanIST', 'Hasley', 'Hoo man', 'Jon Kolbert', 'Linedwell', 'MarcGarver', 'MarcoAurelio', 'Martin Urbanec', 'Masti', 'MusikAnimal', 'Operator873', 'RadiX', 'Ruslik0', 'Sakretsu', 'Schniggendiller', 'Sotiale', 'Stanglavine', 'Stryn', 'Tegel', 'Teles', 'TheresNoTime', 'Tks4Fish', 'Trijnstel', 'Vermont', 'Vituzzu', 'Wiki13', 'Wim b', 'علاء']
	     );



# Template for generating JSON, sorted
my $jsonTemplate = JSON->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish

my $file = 't/groups.json';
my $fileJSON = read_text($file);

my $groupsReturn = $jsonTemplate->decode($fileJSON);
my %groupsQuery = %{${$groupsReturn}{query}};

# Will store hash of editors for each group.  Basically JSON as hash of hashes.
my %groupsData;

%{$groupsData{steward}} = findStewardMembers($groupsQuery{globalallusers});

my @localHashes = @{$groupsQuery{allusers}};
my $localPerms = join q{|}, @rights;
findLocalGroupMembers(\@localHashes, $localPerms, \%groupsData);

plan tests => scalar @rights;

foreach my $userGroup (@rights) {
  my @users = sort keys %{$groupsData{$userGroup}};
  is_deeply(\@users, \@{$actual{$userGroup}}, $userGroup);
}
