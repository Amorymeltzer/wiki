#!/usr/bin/env perl
# Test wikipage processing

use 5.036;

use File::Slurper qw(read_text);
use JSON::MaybeXS ();

use AmoryBot::CratHighlighter qw (processPagesData);
use Test::More;
use Test::Fatal qw(exception);


# Real deal data
my @buro = ('28bytes',      'Acalamari',    'AmandaNP',  'Avraham',   'Bibliomaniac15', 'Cecropia',    'Deskana',       'Dweller',   'Lee Vilenski', 'Maxim',       'Nihonjoe', 'Primefac', 'SilkTork', 'UninvitedCompany', 'Useight', 'Warofdreams', 'WereSpielChequers', 'Worm That Turned', 'Xaosflux', 'Xeno');
my @inta = ('Amorymeltzer', 'Enterprisey',  'Galobtter', 'Izno',      'MusikAnimal',    'MusikBot II', 'Novem Linguae', 'Oshwah',    'Pppery',       'Writ Keeper', 'Xaosflux');
my @over = ('AmandaNP',     'Amorymeltzer', 'Anarchyte', 'Barkeep49', 'Beeblebrox',     'Bradv',       'Cabayi',        'Callanecc', 'CaptainEek',   'Doug Weller', 'Dreamy Jazz', 'Drmies', 'Dweller', 'Enterprisey', 'GB fan', 'GeneralNotability', 'GorillaWarfare', 'Guerillero', 'HJ Mitchell', 'Izno', 'KrakatoaKatie', 'Ks0stm', 'L235', 'Lofty abyss', 'LuK3', 'Mailer diablo', 'Moneytrees', 'Mz7', 'Oshwah', 'PhilKnight', 'Ponyo', 'Primefac', 'Richwales', 'RickinBaltimore', 'Risker', 'Salvio giuliano', 'SilkTork', 'Stwalkerster', 'The Blade of the Northern Lights', 'Thryduulf', 'Vanamonde93', 'Wugapodes', 'Xaosflux');
# my @arbs = ('Barkeep49', 'Beeblebrox', 'Cabayi', 'CaptainEek', 'Enterprisey', 'GeneralNotability', 'Guerillero', 'Izno', 'L235', 'Moneytrees', 'Primefac', 'SilkTork', 'Wugapodes');
my @arbs = qw(Barkeep49 Beeblebrox Cabayi CaptainEek Enterprisey GeneralNotability Guerillero Izno L235 Moneytrees Primefac SilkTork Wugapodes);

# List of each group, but for testing right now just a couple.  Of note, since
# this is just checking processPagesData, which processes page content, it's a
# quick and straightforward process; adding a big honkin' group like sysops
# won't make this test more durable/informative, since it's going to be quick.
my %actual = ('bureaucrat' => \@buro, 'interface-admin' => \@inta, 'oversight' => \@over, 'arbcom' => \@arbs);
my @rights = keys %actual;

plan tests => 6 + 3 * scalar @rights;

# Bad data
like(exception {processPagesData()}, qr/Missing data/, 'No data passed');
like(exception {processPagesData({query => {yomama => []}})}, qr/No page data in query result/, 'No pages key in query response');
like(exception {processPagesData({query => {pages  => []}})}, qr/No page data in query result/, 'No pages in query response');
my $ttitle = 'User:AmoryBot/crathighlighter.js/sysop.json';
like(exception {processPagesData({query => {pages => [{title => $ttitle}]}})},               qr/No revision data for page "$ttitle"/,   'Page missing revisions');
like(exception {processPagesData({query => {pages => [{title => $ttitle, missing => 1}]}})}, qr/Page "$ttitle" does not exist on-wiki/, 'Nonexistent page');


my $file     = 't/file.json';
my $fileJSON = read_text($file);

my $contentReturn = JSON::MaybeXS->new->decode($fileJSON);
my %pagesData     = processPagesData($contentReturn);

# Simple tests.  Can hardcode timestamp since the data is hardcoded
my $titleBaseName = 'User:AmoryBot/crathighlighter.js/';
my %timestamps    = ('bureaucrat' => '2023-06-01T01:13:07Z', 'interface-admin' => '2023-10-31T15:42:04Z', 'oversight' => '2023-11-26T11:42:05Z', 'arbcom' => '2023-11-25T09:42:05Z');
# Default bot subpage locations
foreach my $userGroup (@rights) {
  # Results get keyed by full page title
  my $title = "$titleBaseName$userGroup.json";
  # Title of page matches expected
  is($title, $pagesData{$title}[0], "$userGroup title");
  # Timestamp matches
  is($timestamps{$userGroup}, $pagesData{$title}[2], "$userGroup timestamp");
  # User data matches
  my @users = sort keys %{JSON::MaybeXS->new->decode($pagesData{$title}[1])};
  is_deeply(\@users, \@{$actual{$userGroup}}, $userGroup);
}

# Test a second page for a group, outside the usual pattern
my $extraPage = {title     => 'Wikipedia:Arbitration Committee/members/arbcom.json',
		 revisions => [{timestamp => '2026-01-01T00:00:00Z', slots => {main => {content => '{}'}}}]};
my %extraData = processPagesData({query => {pages => [$extraPage]}});
is_deeply([keys %extraData], ['Wikipedia:Arbitration Committee/members/arbcom.json'], 'Extra title keyed by full title');
