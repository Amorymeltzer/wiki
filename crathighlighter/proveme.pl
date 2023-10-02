#!/usr/bin/env perl
# More easily run prove from another directory via cron

use 5.006;
use strict;
use warnings;

use App::Prove;

# Figure out where this script is
use Cwd 'abs_path';
use File::Basename 'dirname';
chdir dirname abs_path __FILE__ or die 'Failed to change directory';

my $app = App::Prove->new;
# Use the local lib, be real quiet
$app->process_args(('-l', '-Q'));
$app->run;
