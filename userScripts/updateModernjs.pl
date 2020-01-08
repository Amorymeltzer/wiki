#!/usr/bin/env perl
# updateModernjs.pl by Amory Meltzer
# For security reasons, I only import specific revisions of user scripts into
# my modern.js, but if those scripts are subsequently updated it can be a pain
# to 1. know about it (beyond Special:WLH) and 2. update them.  This scripts
# checks each import, presents a diff for me to visually inspect, and prompts
# for confirmation for each item.

use strict;
use warnings;
use diagnostics;

use English qw(-no_match_vars);
use utf8;

use Config::General qw(ParseConfig);
use MediaWiki::API;
use File::Slurper qw(read_text);
use Term::ANSIColor;

# Simpler to just use my twinklerc and check it's the right me
my %conf;
my $config_file = "$ENV{HOME}/.twinklerc";
%conf = ParseConfig($config_file) if -e -f -r $config_file;

# Checks
if (!exists $conf{username} || !exists $conf{password}) {
  print colored ['red'], "Username or password not found, quitting\n";
  exit 1;
}
# Ensure we've only got one item for each config key
foreach my $key (sort keys %conf) {
  if (ref($conf{$key}) eq 'ARRAY') {
    print colored ['red'], "Duplicate config found for $key, quitting\n";
    exit 1;
  }
}
# Make sure it's me
if ($conf{username} !~ '^Amorymeltzer') {
  print colored ['red'], "Not Amorymeltzer, quitting\n";
  exit 1;
}

# Build update
my $modern = 'modern.js';
open my $mod, '<', $modern or die "$ERRNO\n";
while (<$mod>) {
  chomp;
}
close $mod or die "$ERRNO\n";

# Open API and log in
my $mw = MediaWiki::API->new({
			      api_url => 'https://en.wikipedia.org/w/api.php'
			     });
$mw->{ua}->agent('Amorymeltzer/updateModernjs.pl ('.$mw->{ua}->agent.')');
$mw->login({lgname => $conf{username}, lgpassword => $conf{password}});
