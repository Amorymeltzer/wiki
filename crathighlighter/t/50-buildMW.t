#!/usr/bin/env perl
# Test and confirm the mediawiki object, mainly to confirm UA

use 5.036;

use MediaWiki::API;

use AmoryBot::CratHighlighter qw (buildMW);
use Test::More;
use Test::Fatal;

my $user        = 'AmoryBot';
my $scriptName  = 'cratHighlighterSubpages.pl';
my $username    = "$user\@$scriptName";
my $agentString = 'MediaWiki::API/0.52';
my $libName     = 'AmoryBot::CratHighlighter';
my $libVersion  = AmoryBot::CratHighlighter->VERSION;
my $shortUrl    = 'en-wp.org/wiki/User:';
# These are hardcoded in the library
my %opts = (agent => $user,
	    url   => 'https://en.wikipedia.org/w/api.php',
	    retry => 1,
	    delay => 300,
	    get   => 1,
	    error => \&answer
	   );

plan tests => 3 + 3 * (1 + scalar keys %opts);


# Bad object
like(exception {buildMW()},         qr/Missing MW object/,                 'no $mw');
like(exception {buildMW('string')}, qr/Wrong class, not 'MediaWiki::API'/, 'wrong class');

my $mw = new_ok('MediaWiki::API');

my $count = 1;


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
$opts{agent} = 'Amorymeltzer';
$opts{error} = \&answers;
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

  if ($cfg->{on_error}) {
    is(&{$cfg->{on_error}}, $count == 1 ? 42 : 43, "on_error $count (42/43)");
  } else {
    is($cfg->{on_error}, undef, "on_error $count (undef)");
  }

  # Sigh
  my $agent = " $libName/$libVersion (via $agentString)";
  if ($opts{agent}) {
    $agent = "$opts{agent} ($shortUrl$opts{agent})".$agent;
  } else {
    $agent = "($shortUrl".'Amorymeltzer)'.$agent;
  }
  is($mw->{ua}->agent, $agent, "UA $count");
  note 'User agent: '.$mw->{ua}->agent;

  $count++;
}

sub answer {
  return 42;
}

sub answers {
  return 43;
}
