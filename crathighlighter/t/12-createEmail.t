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
my @RemovedFiles = ('Amorymeltzer (OS)', 'Bradv (SYS)', 'Enterprisey (IA)');
my @AddedPages = ('Acalamari (B)', 'AmandaNP (AC)', 'Avraham (SYS)');
my @RemovedPages = ('Amorymeltzer (OS)', 'Bradv (CU)', 'Enterprisey (IA)');
my @testData = (
		\@AddedFiles,
		\@RemovedFiles,
		\@AddedPages,
		\@RemovedPages
	       );
# Number of local and wiki changes, repeatedly used
my @l = qw(B OS SYS IA);
my @w = qw(B AC SYS OS CU IA);
my @null = qw();

my ($l, $w) = (scalar @l, scalar @w);
my $push = 0;

# Note pieces
my $header = "CratHighlighter updates\n\n";
my $files = "Files: $l updated (@l)\n\tAdded: Acalamari (B), AmandaNP (OS), and Avraham (SYS)\n\tRemoved: Amorymeltzer (OS), Bradv (SYS), and Enterprisey (IA)\n";
my $pages = "Pages: $w updated (@w)\n\tAdded: Acalamari (B), AmandaNP (AC), and Avraham (SYS)\n\tRemoved: Amorymeltzer (OS), Bradv (CU), and Enterprisey (IA)\n";

my $note = $header.$files.$pages;
is(createEmail(\@l, \@w, \@testData, $push), $note, 'basic test');

my $noPushNote = $header.$files."Pages: $w not updated (@w)\n";
is(createEmail(\@l, \@w, \@testData, !$push), $noPushNote, 'not pushed');

my $noLocalNote = $header.$pages;
is(createEmail(\@null, \@w, \@testData, $push), $noLocalNote, 'no local');

my $noWikiNote = $header.$files;
is(createEmail(\@l, \@null, \@testData, $push), $noWikiNote, 'no wiki');

# Not possible (see note in main script) but eventually will be...
my $noneNote = "CratHighlighter updates\n\n";
is(createEmail(\@null, \@null, \@testData, $push), $noneNote, 'none');
