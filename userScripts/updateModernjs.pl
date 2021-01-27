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
my @jsFiles = ();
if (!@ARGV) {
  push @jsFiles, 'modern.js';
} else {
  foreach (@ARGV) {
    if (!-e) {
      print colored ['red'], "$_ is not a valid file!\n";
      exit 1;
    }
    push @jsFiles, $_;
  }
}

my %conf;
my $config_file = '.updatemodernrc';
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

## Everything checks out
foreach my $js (@jsFiles) {
  # Make sure we have stuff to process
  # Find all instances of mw.loader.load that target a specific revision
  # Intentionally dumb, the project will be matched later
  my @loaders = `grep -io "mw\.loader\.load('\/\/.*\/w\/index.*&oldid=.*&action=" $js`;

  if (!@loaders) {
    print colored ['yellow'], "No mw.loader.load lines to process in $js\n";
    next;
  }

  # Build lookup hash for each project.  Overkill since I've only got like two
  # or three things that qualify, but makes this more useful.
  my %lookup;
  foreach (@loaders) {
    chomp;
    my $project = s/mw\.loader\.load\('\/\/(.*)\/w\/index.*/$1/r;
    if ($lookup{$project}) {
      push @{$lookup{$project}}, $_;
    } else {
      @{$lookup{$project}} = ($_);
    }
  }


  ## Start processing
  # Items that need updating
  my %replacings;
  my %pagelookup;
  foreach my $project (sort keys %lookup) {
    # Generic basis for each API query, will get reused for individual pages
    my %query = (
		 action => 'query',
		 prop => 'revisions',
		 rvprop => 'ids',
		 format => 'json',
		 formatversion => '2'
		);
    # Initialize with empty array, easier than handling it below
    @{$query{titles}} = ();

    # Prepare titles for bulk query
    foreach my $url (@{$lookup{$project}}) {
      # Pull out title
      my $title = $url =~ s/.*\?title=(.*)&oldid=.*/$1/r;
      # Normalize underscores to spaces, output uses spaces
      $title =~ s/_/ /g;
      # Add onto query, will be combined in a single query
      push @{$query{titles}}, $title;
      # Enable oldid lookup after the fact
      $pagelookup{$title} = $url =~ s/.*&oldid=(.*)&action=.*/$1/r;
    }

    $query{titles} = join q{|}, @{$query{titles}};

    # Open API and log in to each project
    my $mw = MediaWiki::API->new({
				  api_url => "https://$project/w/api.php"
				 });
    $mw->{ua}->agent('Amorymeltzer/updateModernjs.pl ('.$mw->{ua}->agent.')');
    $mw->login({lgname => $conf{username}, lgpassword => $conf{password}});

    my $response = $mw->api(\%query) or die $mw->{error}->{code}.': '.$mw->{error}->{details};
    my @pages = @{$response->{query}->{pages}};

    # Prepare query for one-off queries
    delete $query{titles};
    $query{rvprop} .= '|user|comment|content';

    # Parse and organize response data
    # Check each page
    foreach my $page (@pages) {
      my $title = ${$page}{title};

      # Guard against no found revisions
      if (${$page}{missing}) {
	print "No content revs found for $title, maybe the page was moved or deleted?  Skipping...\n";
	next;
      }

      # This always feels like it should be easier to understand visually than
      # json/xml, but it never is.
      my @revisions = @{${$page}{revisions}};
      my $newID = ${$revisions[0]}{revid};
      my $oldID = $pagelookup{$title};

      # Skip if no differences
      next if !$oldID || !$newID || $oldID == $newID;

      # There are new differences, so let's diff 'em!
      print "$title\n";
      $query{revids} = $oldID.q{|}.$newID;
      my $contentResponse = $mw->api(\%query) or die $mw->{error}->{code}.': '.$mw->{error}->{details};
      # Goddammit
      my @revs = @{@{$contentResponse->{query}->{pages}}[0]->{revisions}};

      # IDs are unique, just use 'em
      map { $pagelookup{$_->{revid}} = $_->{content} } @revs;

      # Store for later in hash of arrays, along with user and edit summary
      @{$replacings{$title}} = ($oldID, $newID, ${$revs[0]}{user}, ${$revs[0]}{comment});

      # Getting bash to work from inside perl - whether by backticks, system, or
      # IPC::Open3 - is one thing, but getting icdiff to work on strings of
      # indeterminate length that each contain several special characters aka
      # code is entirely different.  Writing to files is slower but easier.
      write_text($oldID, $pagelookup{$oldID});
      write_text($newID, $pagelookup{$newID});
    }
  }

  if (keys %replacings) {
    print "\n";
    # Confirm diffs, replace in place
    foreach my $title (keys %replacings) {
      print "\n";
      my ($old, $new, $user, $comment) = @{$replacings{$title}};
      print colored ['green'], "$title: updating $old to $new by $user: $comment\n";

      my @args = ('bash', '-c', "icdiff $old $new");
      system @args;

      print colored ['magenta'], "Update $title to revision $new by $user (Y or N)\n";
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
  } else {
    print colored ['blue'], "No scripts from $js need updating!\n";
  }
}
