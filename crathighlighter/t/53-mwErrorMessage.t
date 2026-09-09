#!/usr/bin/env perl

use 5.036;

use AmoryBot::CratHighlighter qw (mwErrorMessage);
use Test::More tests => 6;
use Test::Fatal qw(exception);

# Bad data
like(exception {mwErrorMessage()}, qr/Missing data/, 'No code');


is(mwErrorMessage(2,  'http'),      "MediaWiki error: HTTP access:\n2: http",           'HTTP access (2)');
is(mwErrorMessage(3,  'api'),       "MediaWiki error: API access:\n3: api",             'API access (3)');
is(mwErrorMessage(4,  'login'),     "MediaWiki error: logging in:\n4: login",           'logging in (4)');
is(mwErrorMessage(5,  'bad token'), "MediaWiki error: editing the page:\n5: bad token", 'editing the page (5)');
is(mwErrorMessage(99, 'unknown'),   "MediaWiki error:\n99: unknown",                    'unknown code goes through');
