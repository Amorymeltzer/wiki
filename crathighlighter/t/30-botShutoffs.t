#!/usr/bin/env perl

use 5.036;

use File::Slurper qw(read_text);
use JSON::MaybeXS ();

use AmoryBot::CratHighlighter qw (botShutoffs);
use Test::More;
plan tests => 5;

# Bad data
is(botShutoffs(), 'No data', 'No data');

is(testFile('t/bot_disabled.json'),  'DISABLED on-wiki',             'Disabled');
is(testFile('t/bot_nocontent.json'), 'DISABLED on-wiki',             'No content');
is(testFile('t/bot_usermsg.json'),   'User has talkpage message(s)', 'User message');
is(testFile('t/bot_allclear.json'),  undef,                          'Success');


# Read in the JSON and process it a la the main script
sub testFile {
  my $fileJSON = read_text(shift);

  my $botReturn = JSON::MaybeXS->new->decode($fileJSON);

  return botShutoffs($botReturn);
}
