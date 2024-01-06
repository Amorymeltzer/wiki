#!/usr/bin/env perl
# Test and confirm the mediawiki object, mainly to confirm UA

# For isa
use 5.036;

use MediaWiki::API;

use AmoryBot::CratHighlighter qw (buildMW);
use Test::More;
plan tests => 2+3*6;

# Bad object
is(buildMW(), undef, 'no $mw');

my $mw = MediaWiki::API->new();
# new_ok? TODO
# isnt? TODO
isa_ok($mw, 'MediaWiki::API', '$mw');

my $count = 1;

my $username = 'Macbeth';
my $agentString = 'MediaWiki::API/0.52';
# These are hardcoded in the library
my %opts = (
	    agent => $username,
	    url => 'https://en.wikipedia.org/w/api.php',
	    retry => 1,
	    delay => 300,
	    get => 1
	    # error => ()
	   );


$mw = buildMW($mw, \%opts);
checkEntries($mw, \%opts);

# E, none of the above
$mw = MediaWiki::API->new();
$mw = buildMW($mw);
delete $opts{agent};
checkEntries($mw, \%opts);

# Different defaults
$opts{url} = 'asdasd';
$opts{retry} = '0';
$opts{delay} = 404;
$opts{get} = '0';
$mw = MediaWiki::API->new();
$mw = buildMW($mw, \%opts);
checkEntries($mw, \%opts);



sub checkEntries {
  my ($mwR, $opts) = @_;

  # Just to check we're still who we think we are
  isa_ok($mw, 'MediaWiki::API', "\$mw $count");

  my $cfg = $mw->{config};
  is($cfg->{api_url}, ${$opts}{url}, "api_url $count");
  is($cfg->{retries}, ${$opts}{retry}, "retries $count");
  is($cfg->{retry_delay}, ${$opts}{delay}, "retry_delay $count");
  is($cfg->{use_http_get}, ${$opts}{get}, "use_http_get $count");

  is($mw->{ua}->agent, $opts{agent} ? "$username ($agentString)" : $agentString, "UA $count");

  $count++;
}
