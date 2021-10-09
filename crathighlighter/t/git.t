#!/usr/bin/env perl
# Ensure the Git repository is clean and on the right branch

use strict;
use warnings;
use diagnostics;

use English;

use Test::More;
# Only enable on toolforge
if ($ENV{LOGNAME} eq 'tools.amorybot') {
  plan tests => 3;
} else {
  plan skip_all => 'Tests annoying when developing';
}
use Git::Repository;

my $repo = Git::Repository->new();

ok(!gitOnMaster($repo), 'On master branch');
ok(!gitCleanStatus($repo), 'Repository is clean');
ok(gitSHA($repo), 'Get a SHA');


# These all mis/abuse @_ for brevity, rather than merely `shift`-ing
sub gitOnMaster {
  return $_[0]->run('rev-parse' => '--abbrev-ref', 'HEAD') ne 'master';
}
sub gitCleanStatus {
  return scalar $_[0]->run(status => '--porcelain');
}
sub gitSHA {
  return scalar $_[0]->run('rev-parse' => '--short', 'HEAD');
}
