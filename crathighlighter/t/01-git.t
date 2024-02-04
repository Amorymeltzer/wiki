#!/usr/bin/env perl
# Ensure the Git repository is clean and on the right branch

use 5.036;

use Test::More;

# Only enable on toolforge or when releasing.  Kubernetes LOGNAME added manually
# via toolforge envvars
if ($ENV{RELEASE_TESTING} || $ENV{LOGNAME} eq 'tools.amorybot.k8s') {
  plan tests => 4;
} else {
  plan skip_all => 'Tests annoying when developing';
}

use AmoryBot::CratHighlighter::GitUtils qw (:all);

my $repo = Git::Repository->new();
ok(!gitOnMain($repo),      'On main branch');
ok(!gitCleanStatus($repo), 'Repository is clean');
ok(gitSHA($repo),          'Get a SHA');
is(gitSHA($repo), $repo->run('rev-parse' => '--short', 'HEAD'), 'Compare SHAs');
