#!/usr/bin/env perl
# Test and confirm the mediawiki object, mainly to confirm UA

# For isa
use 5.036;

use MediaWiki::API;

use AmoryBot::CratHighlighter qw (buildMW);
use Test::More;
plan tests => 7;

my $username = 'Macbeth';
# These are hardcoded in the library
my ($api_url, $retries, $retry_delay, $use_http_get) = ('https://en.wikipedia.org/w/api.php', 1, 300, 1);

my $mw = MediaWiki::API->new();
isa_ok($mw, 'MediaWiki::API', '$mw 1');

$mw = buildMW($mw, $username);
# Just to check we're still who we think we are
isa_ok($mw, 'MediaWiki::API', '$mw 2');

my $cfg = $mw->{config};
is($cfg->{api_url}, $api_url, 'api_url');
is($cfg->{retries}, $retries, 'retries');
is($cfg->{retry_delay}, $retry_delay, 'retry_delay');
is($cfg->{use_http_get}, $use_http_get, 'use_http_get');

# Hardcoded.  Bad.  But whatever.  FIXME
is($mw->{ua}->agent, "$username (MediaWiki::API/0.52)", 'UA');
