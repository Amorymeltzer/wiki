#!/usr/bin/env perl

use 5.036;
use POSIX qw(strftime);

use AmoryBot::CratHighlighter qw (withTimestamp);

use Test::More;
plan tests => 1;

my $message = 'Run completed';
my $result = withTimestamp($message);
my $expected = strftime('%Y-%m-%d %H:%M:%S', localtime) . ": $message";

is($result, $expected, 'output matches timestamp and message');
