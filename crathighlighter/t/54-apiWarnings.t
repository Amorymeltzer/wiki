#!/usr/bin/env perl

use 5.036;

use File::Slurper qw(read_text);
use JSON::MaybeXS ();

use AmoryBot::CratHighlighter qw (apiWarnings);
use Test::More;
use Test::Fatal qw(exception);

plan tests => 4;

# Bad data
like(exception {apiWarnings()}, qr/Missing data/, 'No data');

# No warnings key at all; reuse an existing fixture that lacks one
is_deeply([apiWarnings(testFile('t/bot_allclear.json'))], [], 'No warnings');

# Warnings present, multiple modules
is_deeply([apiWarnings(testFile('t/api_warnings.json'))],  ['abusefilters: The value "5001" for parameter "abflimit" must be between 1 and 5,000.', 'revisions: The value "5001" for parameter "rvlimit" must be between 1 and 5,000.'], 'Multiple module warnings');

# Present but empty; shouldn't happen from the API but shouldn't blow up either
is_deeply([apiWarnings({warnings => {}})], [], 'Empty warnings hash');


# Read in the JSON and decode it a la the main script
sub testFile {
  my $fileJSON = read_text(shift);

  # Template for generating JSON, sorted and prettyish
  my $jsonTemplate = JSON::MaybeXS->new(canonical => 1, indent => 1, space_after => 1);
  return $jsonTemplate->decode($fileJSON);
}
