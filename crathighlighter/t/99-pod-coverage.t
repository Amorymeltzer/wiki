#!perl
use 5.006;
use 5.006;
use strict;
use warnings;

use Test::More;
use Test::Pod::Coverage;

if (!$ENV{RELEASE_TESTING}) {
  plan(skip_all => 'Author tests not required for installation');
}

all_pod_coverage_ok();
