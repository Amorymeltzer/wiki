#!/usr/bin/env perl
# push.pl by Amory Meltzer
# Push new version live to my userspace
# Heavily borrowed from cratHighlighterSubpages.pl, as well as my rewrite of Twinkle's sync.pl:
# https://github.com/azatoth/twinkle/blob/616aeb6e1933162c25a95bbcbf82df0a613f9707/sync.pl

use strict;
use warnings;
use diagnostics;

use English qw(-no_match_vars);
use utf8;

use Config::General qw(ParseConfig);
use MediaWiki::API;
use File::Slurper qw(read_text write_text);
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
# Ensure we've got a clean branch
my $repo = Git::Repository->new();
my @status = $repo->run(status => '--porcelain');
if (scalar @status) {
  print colored ['red'], "Repository is not clean, aborting\n";
  exit;
}

# Open API and log in before anything else
my $mw = MediaWiki::API->new({
			      api_url => "https://en.wikipedia.org/w/api.php"
			     });
$mw->{ua}->agent('Amorymeltzer/push.pl ('.$mw->{ua}->agent.')');
$mw->login({lgname => $conf{username}, lgpassword => $conf{password}});
