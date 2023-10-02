#!/usr/bin/env perl
# Test non-ArbCom group processing

# utf8
use 5.008;
use strict;
use warnings;

use utf8; # Alaa friendly

use File::Slurper qw(read_text);
use JSON::MaybeXS;

use AmoryBot::CratHighlighter qw (findStewardMembers findLocalGroupMembers);
use Test::More;

# List groups; just like in the main script, steward and arbcom are added later
my @rights = qw (bureaucrat suppress checkuser interface-admin sysop);
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

# Need to store stewards for later since they get overwritten by the continue,
# and it's faster/nicer to only process the (large) set of local groups once,
# since it's by user, not by group.  Stewards are easy anyway.
my $stewRef = $groupsQuery{globalallusers};


# Just to match the main script
my @localHashes = @{$groupsQuery{allusers}};
%groupsData = findLocalGroupMembers(\@localHashes, \@rights);

# Stewards are easy
%{$groupsData{steward}} = findStewardMembers($stewRef);
push @rights, qw (steward);

plan tests => 3 + scalar @rights;

# Bad data
is(findLocalGroupMembers(), undef, 'No localData');
is(findLocalGroupMembers(\@localHashes), undef, 'No rightsRef');
is(findStewardMembers(), 0, 'No steward data');

foreach my $userGroup (keys %actual) {
  my @users = sort keys %{$groupsData{$userGroup}};
  is_deeply(\@users, \@{$actual{$userGroup}}, $userGroup);
}
