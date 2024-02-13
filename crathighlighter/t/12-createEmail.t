#!/usr/bin/env perl

use 5.036;

# Relies upon buildNote (which relies upon oxfordComma)
use AmoryBot::CratHighlighter qw(createEmail);
use Test::More tests => 9;


my %testData = (addedFiles   => ['Acalamari (B)',     'AmandaNP (OS)', 'Avraham (SYS)'],
		removedFiles => ['Amorymeltzer (OS)', 'Bradv (SYS)',   'Enterprisey (IA)'],
		addedPages   => ['Acalamari (B)',     'AmandaNP (AC)', 'Avraham (SYS)'],
		removedPages => ['Amorymeltzer (OS)', 'Bradv (CU)',    'Enterprisey (IA)']
	       );

# Number of local and wiki changes, repeatedly used
my @l    = qw(bureaucrat oversight sysop interface-admin);
my @w    = qw(bureaucrat arbcom sysop oversight checkuser interface-admin);
my @null = ();

my ($l, $w) = (scalar @l, scalar @w);
# Rather than use mapGroups here, let's hard code things
my @lMap = qw(B OS SYS IA);
my @wMap = qw(B AC SYS OS CU IA);

my $push = 0;

# Note pieces
my $header     = 'CratHighlighter updates';
my $headerPlus = "$header (@wMap)\n\n";
my $headerBare = "$header\n\n";

my $filesHeader  = "Files: $l updated (@lMap)";
my $pagesHeader  = "Pages: $w updated (@wMap)";
my $filesAdded   = "\tAdded: Acalamari (B), AmandaNP (OS), and Avraham (SYS)";
my $filesRemoved = "\tRemoved: Amorymeltzer (OS), Bradv (SYS), and Enterprisey (IA)";
my $pagesAdded   = "\tAdded: Acalamari (B), AmandaNP (AC), and Avraham (SYS)";
my $pagesRemoved = "\tRemoved: Amorymeltzer (OS), Bradv (CU), and Enterprisey (IA)";
my $files        = makeString($filesHeader, $filesAdded,   $filesRemoved);
my $pages        = makeString($pagesHeader, $pagesAdded,   $pagesRemoved);
my $addedOnly    = makeString($filesHeader, $filesAdded,   $pagesHeader, $pagesAdded);
my $removedOnly  = makeString($filesHeader, $filesRemoved, $pagesHeader, $pagesRemoved);

my $note = $headerPlus.makeString($files, $pages);
is(createEmail(\@l, \@w, \%testData, $push), $note, 'basic test');

my $noteAdded = $headerPlus.$addedOnly;
is(createEmail(\@l, \@w, hashPortion('addedFiles', 'addedPages'), $push), $noteAdded, 'basic but just added');

my $noteRemoved = $headerPlus.$removedOnly;
is(createEmail(\@l, \@w, hashPortion('removedFiles', 'removedPages'), $push), $noteRemoved, 'basic but just removed');

my $noPushNote = $headerBare.$files."\nPages: $w not updated (@wMap)";
is(createEmail(\@l, \@w, \%testData, !$push), $noPushNote, 'not pushed');

my $noLocalNote = $headerPlus.$pages;
is(createEmail(\@null, \@w, \%testData, $push), $noLocalNote, 'no local');

my $noWikiNote = $headerBare.$files;
is(createEmail(\@l, \@null, \%testData, $push), $noWikiNote, 'no wiki');

# Not possible (see note in main script) but eventually will be...
my $noneNote = $headerBare;
is(createEmail(\@null, \@null, \%testData, $push), $noneNote, 'none');

# Bad data, include changeRef?
is(createEmail(),         undef, 'No localRef');
is(createEmail(\@l, q{}), undef, 'No wikiRef');


# Make creating strings easier
sub makeString {
  return join "\n", @_;
}
# Return a hash reference to just the data in the specified keys
sub hashPortion {
  my %lookup = map {$_ => 1} @_;

  # remove the undesirables
  $lookup{$_} = ($lookup{$_} ? $testData{$_} : []) for keys %testData;

  return \%lookup;
}
