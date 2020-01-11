#!/usr/bin/env perl
# updateModernjs.pl by Amory Meltzer
# For security reasons, I only import specific revisions of user scripts into
# my modern.js, but if those scripts are subsequently updated it can be a pain
# to 1. know about it (beyond Special:WLH) and 2. update them.  This script
# checks each import, presents a diff for me to visually inspect, and prompts
# for confirmation for each item.

use strict;
use warnings;
use diagnostics;

use English qw(-no_match_vars);
use utf8;

use Term::ANSIColor;
use Config::General qw(ParseConfig);
use MediaWiki::API;
use File::Slurper qw(write_text);

# Default to modern.js but also accept any other .js file in this directory,
# as of this writing only pedit.js has any such imports in them
my $js = 'modern.js';
if (@ARGV == 1) {
  $js = $ARGV[0] if -e $ARGV[0];
}

# Make sure we have stuff to process
# Find all insteaces of mw.loader.load that target a specific revision
my @loaders = `grep -io "mw\.loader\.load.*en\.wikipedia\.org.*&oldid=.*&action=" $js`;

if (!@loaders) {
  print colored ['red'], "No mw.loader.load lines to process in $js\n";
  exit 1;
}

# Simpler to just use my twinklerc and check a few things
my %conf;
my $config_file = "$ENV{HOME}/.twinklerc";
%conf = ParseConfig($config_file) if -e -f -r $config_file;
# Config checks
if (!exists $conf{username} || !exists $conf{password}) {
  print colored ['red'], "Username or password not found, quitting\n";
  exit 1;
}
foreach my $key (sort keys %conf) {
  if (ref($conf{$key}) eq 'ARRAY') {
    print colored ['red'], "Duplicate config found for $key, quitting\n";
    exit 1;
  }
}
if ($conf{username} !~ '^Amorymeltzer') {
  print colored ['red'], "Not Amorymeltzer, quitting\n";
  exit 1;
}


## Everything checks out
# Open API and log in
my $mw = MediaWiki::API->new({
			      api_url => 'https://en.wikipedia.org/w/api.php'
			     });
$mw->{ua}->agent('Amorymeltzer/updateModernjs.pl ('.$mw->{ua}->agent.')');
$mw->login({lgname => $conf{username}, lgpassword => $conf{password}});

# Start processing
# Generic basis for each API query to get old revisions
my %query = (
	     action => 'query',
	     prop => 'revisions',
	     rvlimit => 1,
	     rvprop => 'content'
	    );
# Items that need updating
my %replacings;
foreach my $url (@loaders) {
  chomp $url;
  my $title = $url =~ s/.*\?title=(.*)&oldid=.*/$1/r;
  my $oldID = $url =~ s/.*&oldid=(.*)&action=.*/$1/r;

  my $wikiPage = $mw->get_page({title => $title});
  my $newID = $wikiPage->{revid};
  if (!$oldID || !$newID) {
    print colored ['red'], "Error processing revision IDs in $js\n";
    exit 1;
  } elsif ($oldID == $newID) {
    print colored ['red'], "Everything up-to-date in $js\n";
    exit;
  }

  # At least some difference exists, so we need to check it out
  my $newContent = $wikiPage->{q{*}};
  $query{titles} = $title;
  $query{rvstartid} = $oldID;
  my $wikiOldid = $mw->api(\%query) or die $mw->{error}->{code}.': '.$mw->{error}->{details};

  # This always feels like it should be easier to understand visually than
  # json/xml, but it never is.
  my ($pageid,$response) = each %{$wikiOldid->{query}->{pages}};
  my %revisions = %{$response->{revisions}[0]};
  my $oldContent = $revisions{q{*}};

  # Store for later in hash of arrays
  @{$replacings{$title}} = ($oldID, $newID);

  # Getting bash to work from inside perl - whether by backticks, system, or
  # IPC::Open3 - is one thing, but getting icdiff to work on strings of
  # indeterminate length that each contain several special characters aka code
  # is entirely different.  Writing to files is slower but easier.
  write_text($oldID, $oldContent);
  write_text($newID, $newContent);
}

# Confirm diffs, replace in place
foreach my $title (keys %replacings) {
  my ($old, $new) = @{$replacings{$title}};
  print colored ['green'], "$title: updating $old to $new\n";

  my @args = ('bash', '-c', "icdiff $old $new");
  system @args;

  print colored ['magenta'], "Update $title to revision $new (Y or N)\n";
  my $confirm = <STDIN>;
  chomp $confirm;
  if (lc $confirm eq 'n') {
    print "Skipping $title\n";
  } elsif (lc $confirm eq 'y') {
    `perl -i -p -e "s/$old/$new/g" $js`;
  } elsif (lc $confirm eq 'q') {
    last;
  }
}

# Clean up
foreach my $title (keys %replacings) {
  unlink $replacings{$title}[0];
  unlink $replacings{$title}[1];
}
