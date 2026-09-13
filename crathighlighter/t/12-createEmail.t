#!/usr/bin/env perl

use 5.036;

# Relies upon buildNote (which relies upon oxfordComma)
use AmoryBot::CratHighlighter qw(createEmail);
use Test::More tests => 12;
use Test::Fatal qw(exception);


my %testData = (addedFiles   => ['Acalamari (B)',     'AmandaNP (OS)', 'Avraham (SYS)'],
		removedFiles => ['Amorymeltzer (OS)', 'Bradv (SYS)',   'Enterprisey (IA)'],
		addedPages   => ['Acalamari (B)',     'AmandaNP (AC)', 'Avraham (SYS)'],
		removedPages => ['Amorymeltzer (OS)', 'Bradv (CU)',    'Enterprisey (IA)']
	       );

# Number of local and wiki changes, repeatedly used
my @l    = qw(bureaucrat oversight sysop interface-admin);
my @w    = qw(bureaucrat arbcom    sysop oversight checkuser interface-admin);
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
my @warn         = ('abusefilters: The value "5001" for parameter "abflimit" must be between 1 and 5,000.', 'revisions: The value "5001" for parameter "rvlimit" must be between 1 and 5,000.');
my $warnBlock    = makeString('Warnings:', map {"\t$_"} @warn)."\n\n";


# Bad data, include changeRef? FIXME TODO
like(exception {createEmail()},         qr/Missing data/, 'No localRef');
like(exception {createEmail(\@l, q{})}, qr/Missing data/, 'No wikiRef');


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

# Not possible (see note in main script) but eventually will be... FIXME TODO
my $noneNote = $headerBare;
is(createEmail(\@null, \@null, \%testData, $push), $noneNote, 'none');

is(createEmail(\@null, \@null, \%testData, $push, []), $noneNote, 'empty warnings same as none');
my $warnOnlyNote = $headerBare.$warnBlock;
is(createEmail(\@null, \@null, \%testData, $push, \@warn), $warnOnlyNote, 'warnings only');

my $warnAndChangesNote = $headerPlus.$warnBlock.makeString($files, $pages);
is(createEmail(\@l, \@w, \%testData, $push, \@warn), $warnAndChangesNote, 'warnings and changes');



# Make creating strings easier
sub makeString {
  return join "\n", @_;
}
# Return a hash reference to just the data in the specified keys
sub hashPortion {
  my @portion = @_;
  my %lookup  = map {$_ => 1} @portion;

  # remove the undesirables
  $lookup{$_} = ($lookup{$_} ? $testData{$_} : []) for keys %testData;

  return \%lookup;
}
