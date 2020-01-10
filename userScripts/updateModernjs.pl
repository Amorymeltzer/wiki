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

use IPC::Open3 qw(open3);
use Config::General qw(ParseConfig);
use MediaWiki::API;
use File::Slurper qw(write_text);
use Term::ANSIColor;

# Make sure we have stuff to process
# Use IPC::Open3 just because!
my ($writer, $reader, $err);
# Find all insteaces of mw.loader.load that target a specific revision
open3($writer, $reader, $err, 'grep -io "mw\.loader\.load.*&oldid=.*&action=" modern.js');
my @loaders = <$reader>;

if (!@loaders) {
  print colored ['red'], "No mw.loader.load lines to process, quitting\n";
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
# my $mw = MediaWiki::API->new({
# 			      api_url => 'https://en.wikipedia.org/w/api.php'
# 			     });
# $mw->{ua}->agent('Amorymeltzer/updateModernjs.pl ('.$mw->{ua}->agent.')');
# $mw->login({lgname => $conf{username}, lgpassword => $conf{password}});

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
my $count = 0;
foreach my $url (@loaders) {
  chomp $url;
  my $title = $url =~ s/.*\?title=(.*)&oldid=.*/$1/r;
  my $oldID = $url =~ s/.*&oldid=(.*)&action=.*/$1/r;

  # print "title: $title\toldid: $oldID\n";
  # my $wikiPage = $mw->get_page({title => $title});
  # my $newID = $wikiPage->{revid};
  # next if $oldID == $newID || !$newID || !$oldID;

  # # At least some difference exists, so we need to check it out
  # my $newContent = $wikiPage->{q{*}};
  # $query{titles} = $title;
  # $query{rvstartid} = $oldID;
  # my $wikiOldid = $mw->api(\%query) or die $mw->{error}->{code}.': '.$mw->{error}->{details};

  # my ($pageid,$response) = each %{$wikiOldid->{query}->{pages}};
  # my %revisions = %{$response->{revisions}[0]};
  # my $oldContent = $revisions{q{*}};

  my $newID = int $oldID / 2;
  my $oldContent = 'asdasdlkjaskd ddd' . $oldID;
  my $newContent = 'kajsdajksdhas dah' . $newID;

  %{$replacings{$title}} = (
			old => [$oldID, $oldContent],
			new => [$newID, $newContent]
		       );

  # write_text($oldID, $oldContent);
  # write_text($newID, $newContent);
  $count++;

  last if $count > 3;
}

# use Data::Dumper;
# print Dumper(%replacings);

foreach my $title (keys %replacings) {
  # print "old: $replacings{$title}{old}";
  # print "old: @{$replacings{$title}{old}}\tnew: @{$replacings{$title}{new}}\n";
  print "$title: $replacings{$title}{old}[0] to $replacings{$title}{new}[0]\n";
  my $old = $replacings{$title}{old}[0];
  my $new = $replacings{$title}{new}[0];
  my $ol = $replacings{$title}{old}[1];
  my $ne = $replacings{$title}{new}[1];
  open3($writer, $reader, $err, "bash -c 'icdiff <(echo $ol) <(echo $ne)'");
  my @res = <$reader>;
  print "@res\n";
  # my @args = ('bash', '-c', "icdiff <(echo $ol) <(echo $ne)");
  # my $out = system @args;
  #print "$out\n";

  print "Update $title to revision $new (Y or N)\n";
  my $confirm = <STDIN>;
  chomp $confirm;
  if (lc $confirm eq 'n') {
    print "Skipping $title\n";
  } elsif (lc $confirm eq 'y') {
    `perl -i -p -e "s/$old/$new/g" modern.js`;
  } elsif (lc $confirm eq 'q') {
    last;
  }
}
