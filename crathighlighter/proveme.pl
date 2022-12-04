#!/usr/bin/env perl
# More easily run prove from another directory via cron

use strict;
use warnings;

use FindBin qw($Bin);
use App::Prove;

chdir "$Bin" or die 'Failed to change directory';

my $app = App::Prove->new;
# Use the local lib, be real quiet
$app->process_args(('-l', '-Q'));
$app->run;
