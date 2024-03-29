#!/usr/bin/env perl

use 5.036;

use Test::More;
use Test::Pod::Coverage;

if (!$ENV{RELEASE_TESTING}) {
  plan(skip_all => 'Author tests not required for installation');
}

all_pod_coverage_ok();
