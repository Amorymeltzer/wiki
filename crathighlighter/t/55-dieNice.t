#!/usr/bin/env perl

use 5.036;

use AmoryBot::CratHighlighter qw(dieNice);
use Test::More tests => 9;
use Test::Fatal qw(exception);

# Bad data
like(exception {dieNice()},                           qr/Missing data/,                      'No mw');
like(exception {dieNice({})},                         qr/No error in MediaWiki::API object/, 'No error object');
like(exception {dieNice({error => {}})},              qr/No error in MediaWiki::API object/, 'No code');
like(exception {dieNice({error => {code => undef}})}, qr/No error in MediaWiki::API object/, 'Falsey code');


# Each known code in mwErrorMessage
my %codes = (2 => 'HTTP access', 3 => 'API access', 4 => 'logging in', 5 => 'editing the page');
foreach my $code (sort keys %codes) {
  my $mw = {error => {code => $code, details => '42'}};
  is(exception {dieNice($mw)}, "MediaWiki error: $codes{$code}:\n$code: 42\n", "Code $code");
}

# Other codes
is(exception {dieNice({error => {code => 7, details => '42'}})}, "MediaWiki error:\n7: 42\n", 'Unmapped code');
