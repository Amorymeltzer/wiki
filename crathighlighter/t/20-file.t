#!/usr/bin/env perl
# Test wikipage processing

use strict;
use warnings;
use diagnostics;

use English;

use File::Slurper qw(read_text);
use JSON::MaybeXS;

use Test::More tests => 3;

# List of each group, but for testing right now just a couple
my @rights = qw(bureaucrat interface-admin oversight);
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

foreach my $userGroup (@rights) {
  my @users = sort keys %{$jsonTemplate->decode($contentData{$userGroup}[1])};
  is_deeply(\@users, \@{$actual{$userGroup}}, $userGroup);
}


# Build hash of array with per group page title, content, and last edited time
# Maybe something about formatversion 1 or 2??? FIXME TODO
sub processFileData {
  my $contentRef = shift;
  my %returnData;
  # This monstrosity results in an array where each item is an array of hashes:
  ## title     -> used to also snag the specific group used for hash key
  ## revisions -> array containing one item, which is a hash, which has keys:
  ### content   -> full page content
  ### timestamp -> time last edited
  # Just awful.  Then again, it could be made even worse!
  foreach my $pageHash (@{${${$contentRef}{query}}{pages}}) {
    my $userGroup = ${$pageHash}{title} =~ s/.*\.js\/(.+)\.json/$1/r;
    my @revisions = @{${$pageHash}{revisions}};
    $returnData{$userGroup} = [${$pageHash}{title},${$revisions[0]}{content},${$revisions[0]}{timestamp}];
  }

  return %returnData;
}
