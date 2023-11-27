#!/usr/bin/env perl
# Test wikipage processing

use 5.006;
use strict;
use warnings;

use File::Slurper qw(read_text);
use JSON::MaybeXS;

use AmoryBot::CratHighlighter qw (processFileData);
use Test::More;


# Real deal data
my @buro = ('28bytes', 'Acalamari', 'AmandaNP', 'Avraham', 'Bibliomaniac15', 'Cecropia', 'Deskana', 'Dweller', 'Lee Vilenski', 'Maxim', 'Nihonjoe', 'Primefac', 'SilkTork', 'UninvitedCompany', 'Useight', 'Warofdreams', 'WereSpielChequers', 'Worm That Turned', 'Xaosflux', 'Xeno');
my @inta = ('Amorymeltzer', 'Enterprisey', 'Galobtter', 'Izno', 'MusikAnimal', 'MusikBot II', 'Novem Linguae', 'Oshwah', 'Pppery', 'Writ Keeper', 'Xaosflux');
my @over = ('AmandaNP', 'Amorymeltzer', 'Anarchyte', 'Barkeep49', 'Beeblebrox', 'Bradv', 'Cabayi', 'Callanecc', 'CaptainEek', 'Doug Weller', 'Dreamy Jazz', 'Drmies', 'Dweller', 'Enterprisey', 'GB fan', 'GeneralNotability', 'GorillaWarfare', 'Guerillero', 'HJ Mitchell', 'Izno', 'KrakatoaKatie', 'Ks0stm', 'L235', 'Lofty abyss', 'LuK3', 'Mailer diablo', 'Moneytrees', 'Mz7', 'Oshwah', 'PhilKnight', 'Ponyo', 'Primefac', 'Richwales', 'RickinBaltimore', 'Risker', 'Salvio giuliano', 'SilkTork', 'Stwalkerster', 'The Blade of the Northern Lights', 'Thryduulf', 'Vanamonde93', 'Wugapodes', 'Xaosflux');
# my @arbs = ('Barkeep49', 'Beeblebrox', 'Cabayi', 'CaptainEek', 'Enterprisey', 'GeneralNotability', 'Guerillero', 'Izno', 'L235', 'Moneytrees', 'Primefac', 'SilkTork', 'Wugapodes');
my @arbs = qw(Barkeep49 Beeblebrox Cabayi CaptainEek Enterprisey GeneralNotability Guerillero Izno L235 Moneytrees Primefac SilkTork Wugapodes);

# List of each group, but for testing right now just a couple.  Of note, since
# this is just checking processFileData, which processes page content, it's a
# quick and straightforward process; adding a big honkin' group like sysops
# won't make this test more durable/informative, since it's going to be quick.
my %actual = ('bureaucrat' => \@buro, 'interface-admin' => \@inta, 'oversight' => \@over, 'arbcom' => \@arbs);
my @rights = keys %actual;

plan tests => 1+3*scalar @rights;

# Bad data
is(processFileData(), undef, 'No data passed');

# Template for generating JSON, sorted
my $jsonTemplate = JSON->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish

my $file = 't/file.json';
my $fileJSON = read_text($file);

my $contentReturn = $jsonTemplate->decode($fileJSON);
my %contentData = processFileData($contentReturn);

# Simple tests.  Can hardcode timestamp since the data is hardcoded
my $titleBaseName = 'User:AmoryBot/crathighlighter.js/';
my %timestamps = ('bureaucrat' => '2023-06-01T01:13:07Z', 'interface-admin' => '2023-10-31T15:42:04Z', 'oversight' => '2023-11-26T11:42:05Z', 'arbcom' => '2023-11-25T09:42:05Z');

foreach my $userGroup (@rights) {
  # Title of page matches expected
  is("$titleBaseName$userGroup.json", $contentData{$userGroup}[0], "$userGroup title");
  # Timestamp matches
  is($timestamps{$userGroup}, $contentData{$userGroup}[2], "$userGroup timestamp");
  # User data matches
  my @users = sort keys %{$jsonTemplate->decode($contentData{$userGroup}[1])};
  is_deeply(\@users, \@{$actual{$userGroup}}, $userGroup);
}
