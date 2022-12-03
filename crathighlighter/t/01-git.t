#!/usr/bin/env perl
# Ensure the Git repository is clean and on the right branch

use strict;
use warnings;

use Test::More;

# Only enable on toolforge or when releasing
if ($ENV{RELEASE_TESTING} || $ENV{LOGNAME} eq 'tools.amorybot') {
  plan tests => 3;
} else {
  plan skip_all => 'Tests annoying when developing';
}

use AmoryBot::CratHighlighter::GitUtils qw (gitOnMain gitCleanStatus gitSHA);

my $repo = Git::Repository->new();

ok(!gitOnMain($repo), 'On main branch');
ok(!gitCleanStatus($repo), 'Repository is clean');
ok(gitSHA($repo), 'Get a SHA');
