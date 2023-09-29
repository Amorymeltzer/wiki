#!/usr/bin/env perl

use strict;
use warnings;

use File::Slurper qw(read_text);
use JSON::MaybeXS;

use AmoryBot::CratHighlighter qw (botShutoffs);
use Test::More;
plan tests => 5;

# Bad data
is(botShutoffs(), 'No data', 'No data');
is(testFile('t/bot_disabled.json'), 'DISABLED on-wiki', 'Disabled');
is(testFile('t/bot_nocontent.json'), 'DISABLED on-wiki', 'No content');
is(testFile('t/bot_usermsg.json'), 'User has talkpage message(s)', 'User message');
is(testFile('t/bot_allclear.json'), undef, 'Success');


sub testFile {
  my $fileJSON = read_text(shift);

  # Template for generating JSON, sorted
  my $jsonTemplate = JSON->new->canonical(1);
  $jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish

  my $botReturn = $jsonTemplate->decode($fileJSON);

  return botShutoffs($botReturn);
}
