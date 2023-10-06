#!/usr/bin/env perl

use 5.006;
use strict;
use warnings;

use Test::More;

plan tests => 4;

BEGIN {
  # uncoverable branch true; Annoying: "true" means the unless case aka "false"
  use_ok('AmoryBot::CratHighlighter') or BAIL_OUT "Couldn't load module AmoryBot::CratHighlighter\n";
  # uncoverable branch true
  use_ok('AmoryBot::CratHighlighter', qw(:all)) or BAIL_OUT "Couldn't load module AmoryBot::CratHighlighter qw(:all)\n";
  # uncoverable branch true
  use_ok('AmoryBot::CratHighlighter::GitUtils') or BAIL_OUT "Couldn't load module AmoryBot::CratHighlighter::GitUtils\n";
  # uncoverable branch true
  use_ok('AmoryBot::CratHighlighter::GitUtils', qw(:all)) or BAIL_OUT "Couldn't load module AmoryBot::CratHighlighter::GitUtils qw(:all)\n";
}
