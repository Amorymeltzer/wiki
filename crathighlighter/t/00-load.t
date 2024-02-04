#!/usr/bin/env perl

use 5.036;

use Test::More;

plan tests => 8;

BEGIN {
  # uncoverable branch true; Annoying: "true" means the unless case aka "false"
  use_ok('AmoryBot::CratHighlighter') or BAIL_OUT "Couldn't load module AmoryBot::CratHighlighter\n";
  # uncoverable branch true
  use_ok('AmoryBot::CratHighlighter', qw(:all)) or BAIL_OUT "Couldn't load module AmoryBot::CratHighlighter qw(:all)\n";
  # uncoverable branch true
  use_ok('AmoryBot::CratHighlighter::GitUtils') or BAIL_OUT "Couldn't load module AmoryBot::CratHighlighter::GitUtils\n";
  # uncoverable branch true
  use_ok('AmoryBot::CratHighlighter::GitUtils', qw(:all)) or BAIL_OUT "Couldn't load module AmoryBot::CratHighlighter::GitUtils qw(:all)\n";

  # Imports in main script
  # uncoverable branch true
  use_ok('Log::Log4perl', qw(:easy)) or BAIL_OUT "Couldn't load module Log::Log4perl qw(:easy)\n";
  # uncoverable branch true
  use_ok('JSON::MaybeXS') or BAIL_OUT "Couldn't load module JSON::MaybeXS\n";
  # uncoverable branch true
  use_ok('MediaWiki::API') or BAIL_OUT "Couldn't load module MediaWiki::API\n";
  # uncoverable branch true
  use_ok('File::Slurper', qw(read_text write_text)) or BAIL_OUT "Couldn't load module File::Slurper qw(read_text write_text)\n";
}
