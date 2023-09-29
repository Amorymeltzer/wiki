#!/usr/bin/env perl
# Test wikipage processing

use strict;
use warnings;

use File::Slurper qw(read_text);
use JSON::MaybeXS;

use AmoryBot::CratHighlighter qw (processFileData);
use Test::More;

# List of each group, but for testing right now just a couple
my @rights = qw(bureaucrat interface-admin oversight);

plan tests => 1+3*scalar @rights;

is(processFileData(), undef, 'No data passed');

# Real deal
my @buro = ('Acalamari', 'AmandaNP', 'Avraham', 'Bibliomaniac15', 'Cecropia', 'Deskana', 'Dweller', 'MBisanz', 'Maxim', 'Nihonjoe', 'Primefac', 'SilkTork', 'UninvitedCompany', 'Useight', 'Warofdreams', 'WereSpielChequers', 'Worm That Turned', 'Xaosflux', 'Xeno');
my @inta = ('Amorymeltzer', 'Cyberpower678', 'Enterprisey', 'Evad37', 'Izno', 'MusikAnimal', 'MusikBot II', 'Oshwah', 'Ragesoss', 'Writ Keeper', 'Xaosflux');
my @over = ('AmandaNP', 'Amorymeltzer', 'Dweller', 'Maxim', 'Oshwah', 'Primefac', 'Worm That Turned', 'Xaosflux');
my %actual = ('bureaucrat' => \@buro, 'interface-admin' => \@inta, 'oversight' => \@over);

# Template for generating JSON, sorted
my $jsonTemplate = JSON->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish

my $file = 't/file.json';
my $fileJSON = read_text($file);

my $contentReturn = $jsonTemplate->decode($fileJSON);
my %contentData = processFileData($contentReturn);

# Simple tests.  Can hardcode timestamp since the data is hardcoded
my $titleBaseName = 'User:AmoryBot/crathighlighter.js/';
my %timestamps = ('bureaucrat' => '2022-11-30T02:14:57Z', 'interface-admin' => '2022-12-29T03:42:05Z', 'oversight' => '2022-11-30T02:14:57Z');

foreach my $userGroup (@rights) {
  # Title of page matches expected
  is("$titleBaseName$userGroup.json", $contentData{$userGroup}[0], "$userGroup title");
  # Timestamp matches
  is($timestamps{$userGroup}, $contentData{$userGroup}[2], "$userGroup timestamp");
  # User data matches
  my @users = sort keys %{$jsonTemplate->decode($contentData{$userGroup}[1])};
  is_deeply(\@users, \@{$actual{$userGroup}}, $userGroup);
}
