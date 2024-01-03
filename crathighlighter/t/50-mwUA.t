#!/usr/bin/env perl

# Test and confirm the mediawiki object, mainly to confirm UA.  Not part of the
# library because it seems silly to import MediaWiki::API just for this, and
# also because then I'd have to log-in and add dieNice separately.  Should
# probably do that.  But until then, this needs to be kept (largely) in sync
# with mwLogin in the main script.

# For isa
use 5.036;

use MediaWiki::API;

use Test::More;
plan tests => 6;

my ($un, $pw) = ('Macbeth', 'Lady Macbeth');
my ($api_url, $retries, $retry_delay, $use_http_get) = ('https://en.wikipedia.org/w/api.php', 1, 300, 1);

my $mw = mwLogin($un, $pw);

isa_ok($mw, 'MediaWiki::API', '$mw');

my $cfg = $mw->{config};
is($cfg->{api_url}, $api_url, 'api_url');
is($cfg->{retries}, $retries, 'retries');
is($cfg->{retry_delay}, $retry_delay, 'retry_delay');
is($cfg->{use_http_get}, $use_http_get, 'use_http_get');

# Hardcoded.  Bad.  But whatever.  FIXME
is($mw->{ua}->agent, "$un (MediaWiki::API/0.52)", 'UA');

sub mwLogin {
  my ($username, $password) = @_;

  # Global, declared above
  $mw = MediaWiki::API->new({
			     api_url => $api_url,
			     retries => $retries,
			     retry_delay => $retry_delay, # Try again after 5 mins
			     use_http_get => $use_http_get # use GET where appropriate
			    });
  $mw->{ua}->agent("$username (".$mw->{ua}->agent.')');
  return $mw;
}
