#!/usr/bin/env perl

use strict;
use warnings;

use File::Slurper qw(read_text);
use JSON::MaybeXS;

use Test::More;
plan tests => 5;

# Bad data
is(botShutoffs(), undef, 'No data');
is(testFile('t/bot_disabled.json'), undef, 'Disabled');
is(testFile('t/bot_nocontent.json'), undef, 'No content');
is(testFile('t/bot_usermsg.json'), undef, 'User message');
is(testFile('t/bot_allclear.json'), 'Success', 'Success');


sub testFile {
  my $fileJSON = read_text(shift);

  # Template for generating JSON, sorted
  my $jsonTemplate = JSON->new->canonical(1);
  $jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish

  my $botReturn = $jsonTemplate->decode($fileJSON);

  # return 'Success';
  return botShutoffs($botReturn);
}


# Duplicated and tweaked from the main script, not in the module because it uses
# MediaWiki::API and Log::Log4perl
sub botShutoffs {
  my $json = shift;
  return if ! $json;

  my $botCheckReturnQuery = ${$json}{query};

  # Manual shutoff; confirm bot should actually run
  # Arrows means no (de)referencing
  my $checkContent = $botCheckReturnQuery->{pages}[0]->{revisions}[0]->{content};
  if (!$checkContent || $checkContent ne '42') {
    return;
  }

  # Automatic shutoff: user has talkpage messages.  Unlikely as it redirects to
  # my main talk page, which I *don't* want to be an autoshutoff.
  my $userNotes = $botCheckReturnQuery->{userinfo}->{messages};
  if ($userNotes) {
    return;
  }
  # Okay this is different
  return 'Success';
}
