#!/usr/bin/env perl
# Test and confirm the mediawiki object, mainly to confirm UA

# new_ok in Test::More first part of Perl v5.10.1
use 5.010001;

use strict;
use warnings;

use MediaWiki::API;

use AmoryBot::CratHighlighter qw (buildMW);
use Test::More;
plan tests => 3 + 3 * 6;

# Bad object
is(buildMW(), undef, 'no $mw');
my $string = 'string';
is(buildMW($string), undef, 'wrong class');

my $mw = new_ok('MediaWiki::API');

my $count = 1;

my $user        = 'Macbeth';
my $scriptName  = 'cratHighlighterSubpages.pl';
my $username    = "$user\@$scriptName";
my $agentString = 'MediaWiki::API/0.52';
# These are hardcoded in the library
my %opts = (agent => $username,
	    url   => 'https://en.wikipedia.org/w/api.php',
	    retry => 1,
	    delay => 300,
	    get   => 1
	    # error => ()
	   );


# Should make these more organized FIXME TODO
$mw = buildMW($mw, \%opts);
checkEntries($mw, \%opts);

# E, none of the above
$mw = buildMW(MediaWiki::API->new());
delete $opts{agent};
checkEntries($mw, \%opts);

# Different defaults
$opts{url}   = 'asdasd';
$opts{retry} = '0';
$opts{delay} = 404;
$opts{get}   = '0';
$opts{agent} = $user;
$mw          = buildMW(MediaWiki::API->new(), \%opts);
checkEntries($mw, \%opts);



sub checkEntries {
  my ($mwR, $opts) = @_;

  # Just to check we're still who we think we are
  isa_ok($mw, 'MediaWiki::API', "\$mw $count");

  my $cfg = $mw->{config};
  is($cfg->{api_url},      ${$opts}{url},   "api_url $count");
  is($cfg->{retries},      ${$opts}{retry}, "retries $count");
  is($cfg->{retry_delay},  ${$opts}{delay}, "retry_delay $count");
  is($cfg->{use_http_get}, ${$opts}{get},   "use_http_get $count");

  is($mw->{ua}->agent, $opts{agent} ? "$opts{agent} ($agentString)" : $agentString, "UA $count");

  $count++;
  return;
}
