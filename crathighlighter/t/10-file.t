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

# Timestamp isn't being tested, but I should probably include it in the file
# itself.  I've nothing to compare it to, but since this data is hardcoded, I
# could at least confirm I've got it instead of undef FIXME
plan tests => 2*scalar @rights;

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

my $titleBaseName = 'User:Amorymeltzer/crathighlighter.js/';

foreach my $userGroup (@rights) {
  # Title of page matches expected
  is("$titleBaseName$userGroup.json", $contentData{$userGroup}[0], "$userGroup title");
  # User data matches
  my @users = sort keys %{$jsonTemplate->decode($contentData{$userGroup}[1])};
  is_deeply(\@users, \@{$actual{$userGroup}}, $userGroup);
}
