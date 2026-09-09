#!/usr/bin/env perl

use 5.036;

use File::Slurper qw(read_text);
use JSON::MaybeXS ();

use AmoryBot::CratHighlighter qw(getPageContent);
use Test::More tests => 5;
use Test::Fatal qw(exception);

# Bad data
like(exception {getPageContent()},   qr/Missing data/,                 'No data');
like(exception {getPageContent({})}, qr/No page data in query result/, 'No pages in query response');
my $missing = {pages => [{ns => 2, title => 'User:Amorymeltzerzzz', missing => 1}]};
like(exception {getPageContent($missing)}, qr/No revision data in page query result/, 'No revisions in page query response');

# Template for generating JSON, sorted and prettyish
my $jsonTemplate = JSON::MaybeXS->new(canonical => 1, indent => 1, space_after => 1);

# Single-page response aka botShutoffs
is(testFile('t/bot_allclear.json'), '42', 'single page');

# Multi-page response aka arbcom content.  The page content is itself JSON so
# we're decoding JSON to get content which needs decoding.
my $multiReturn = $jsonTemplate->decode(read_text('t/file.json'))->{query};
my @users       = sort keys %{$jsonTemplate->decode(testFile('t/file.json'))};
is_deeply(\@users, ['Barkeep49', 'Beeblebrox', 'Cabayi', 'CaptainEek', 'Enterprisey', 'GeneralNotability', 'Guerillero', 'Izno', 'L235', 'Moneytrees', 'Primefac', 'SilkTork', 'Wugapodes'], 'first of multiple pages (arbcom)');


# Read in the JSON and process it a la the main script
sub testFile {
  my $fileJSON = read_text(shift);

  my $pageReturn = $jsonTemplate->decode($fileJSON)->{query};

  return getPageContent($pageReturn);
}
