#!/usr/bin/env perl

use strict;
use warnings;

# Relies upon buildNote (which relies upon oxfordComma)
use AmoryBot::CratHighlighter qw(createEmail);
use Test::More tests => 5;


# I hate array referencing, somehow hashes are easier?!  Only done this way to
# match with the data structures in the main script, but should probably be
# reworked at some point FIXME TODO
my @AddedFiles = ('Acalamari (B)', 'AmandaNP (OS)', 'Avraham (SYS)');
my @RemovedFiles = ('Amorymeltzer (OS)', 'Cyberpower678 (SYS)', 'Enterprisey (IA)');
my @AddedPages = ('Acalamari (B)', 'AmandaNP (AC)', 'Avraham (SYS)');
my @RemovedPages = ('Amorymeltzer (OS)', 'Cyberpower678 (SYS)', 'Enterprisey (IA)');
my @testData = (
		\@AddedFiles,
		\@RemovedFiles,
		\@AddedPages,
		\@RemovedPages
	       );
# Number of local and wiki changes, repeatedly used
my ($l, $w) = (4, 5);
my $push = 0;


my $note = "CratHighlighter updates\n\nFiles: $l updated\n\tAdded: Acalamari (B), AmandaNP (OS), and Avraham (SYS)\n\tRemoved: Amorymeltzer (OS), Cyberpower678 (SYS), and Enterprisey (IA)\nPages: $w updated\n\tAdded: Acalamari (B), AmandaNP (AC), and Avraham (SYS)\n\tRemoved: Amorymeltzer (OS), Cyberpower678 (SYS), and Enterprisey (IA)\n";

is(createEmail($l, $w, \@testData, $push), $note, 'basic test');

my $noPushNote = "CratHighlighter updates\n\nFiles: $l updated\n\tAdded: Acalamari (B), AmandaNP (OS), and Avraham (SYS)\n\tRemoved: Amorymeltzer (OS), Cyberpower678 (SYS), and Enterprisey (IA)\nPages: $w not updated\n";

is(createEmail($l, $w, \@testData, !$push), $noPushNote, 'not pushed');

my $noLocalNote = "CratHighlighter updates\n\nPages: $w updated\n\tAdded: Acalamari (B), AmandaNP (AC), and Avraham (SYS)\n\tRemoved: Amorymeltzer (OS), Cyberpower678 (SYS), and Enterprisey (IA)\n";

is(createEmail(0, $w, \@testData, $push), $noLocalNote, 'no local');

my $noWikiNote = "CratHighlighter updates\n\nFiles: $l updated\n\tAdded: Acalamari (B), AmandaNP (OS), and Avraham (SYS)\n\tRemoved: Amorymeltzer (OS), Cyberpower678 (SYS), and Enterprisey (IA)\n";

is(createEmail($l, 0, \@testData, $push), $noWikiNote, 'no wiki');

# Not possible (see note in main script) but eventually will be...
my $noneNote = "CratHighlighter updates\n\n";

is(createEmail(0, 0, \@testData, $push), $noneNote, 'none');
