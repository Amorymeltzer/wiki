#!/usr/bin/env perl
# cratHighlighterSubpages.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Sync JSON lists for crathighlighter.js
# https://en.wikipedia.org/wiki/User:Amorymeltzer/crathighlighter
# Run via cron on toolforge as User:AmoryBot

use strict;
use warnings;
use English qw(-no_match_vars); # Avoid regex speed penalty in perl <=5.16

use Getopt::Long;

# Parse commandline options
my %opts = ();
GetOptions(\%opts, 'P', 'n', 'L', 'help' => \&usage);

# Figure out where this script is
use Cwd 'abs_path';
use File::Basename 'dirname';
# Get ready for local lib, also used elsewhere for logs and chdir
my $scriptDir;
BEGIN {
    $scriptDir = dirname abs_path __FILE__;
}

# Allow script to be run from elsewhere by prepending the local library to @INC
use lib $scriptDir.'/lib';
use AmoryBot::CratHighlighter qw(:all);

use Log::Log4perl qw(:easy);
use JSON::MaybeXS;
use MediaWiki::API;
use File::Slurper qw(read_text write_text);


my $logfile = "$scriptDir/log.log";
# easy_init doesn't check the file is actually writable, so do it ourselves.
# Won't help if the whole filesystem is read-only, but whaddaya gonna do?
-W $logfile or die $ERRNO;
# Set up logger.  The full options are straightforward but overly verbose, and
# easy mode (with stealth loggers) is succinct and sufficient.  Duplicated in
# gitSync.pl
my $infoLog =  { level  => $opts{L} ? $OFF : $INFO,
		 file   => ">>$logfile",
		 utf8   => 1,
		 # Datetime (level): message
		 layout => '%d{yyyy-MM-dd HH:mm:ss} (%p): %m{indent}%n' };
# Only if not being run via cron, known thanks to CRON=1 in crontab
my $traceLog = { level  => $opts{L} ? $OFF : $TRACE,
		 file   => 'STDOUT',
		 # message
		 layout => '%d - %m{indent}%n' };
Log::Log4perl->easy_init($ENV{CRON} ? $infoLog : ($infoLog, $traceLog));

# Pop into this script's directory so config and json file access is easy.  I'd
# like to get rid of this, but I have to change around things when read_text and
# write_text with the json files. FIXME TODO
chdir $scriptDir or LOGDIE('Failed to change directory');


# Define the bot and non-bot users, then check if this is being run on the
# toolforge grid.  It's a little added complexity but makes it easier for me to
# test API things without changing configs, etc.
my ($botUser, $userUser) = qw (AmoryBot Amorymeltzer);
my $user = $ENV{LOGNAME} eq 'tools.amorybot' ? $botUser : $userUser;

### Initialize API object.  Get username/password combo, log in, etc.
my $mw = mwLogin($user);

# Used globally to make edit summaries, page titles, etc. easier
my $userPage = 'User:'.$user;

### If this is the bot account, include a few checks for (emergency) shutoff
botQuery($user);

### Get the current group information.  References since we want both a hash and
### an array back.  The @groups/$groups is only really used since I want an
### order to how items are returned to me, otherwise simply taking the keys of
### the hash would work just fine.
my ($groupsStore, $groups) = getCurrentGroups();

### Latest content of each on-wiki page
my %contentStore = getPageGroups(@{$groups});


### Main loop for each group
# These conveniently function as indicators as well as counters for number of
# files or pages changed, respectively
my (@localChange, @wikiChange);
my (@AddedFiles, @RemovedFiles, @AddedPages, @RemovedPages);
# Template for generating JSON, sorted
# Make into hashref? https://metacpan.org/pod/JSON::MaybeXS#new TODO
my $jsonTemplate = JSON->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish
foreach (@{$groups}) {
  my $note;
  my %queryHash = %{${$groupsStore}{$_}}; # Just the specific rights hash we want
  my $queryJSON; # JSON will only be built from the query if there are any updates

  # Check if local records have changed.  Would be good to check this early,
  # just in case something is wrong.  Would be even better to just create the
  # damn file if need be.  Remind me why I care about the local files? TODO
  my $file = $_.'.json';

  # read_text and write_text don't actually return anything
  # (<https://rt.cpan.org/Public/Bug/Display.html?id=114341>) so should maybe
  # test them? FIXME TODO
  my $fileJSON = read_text($file) or LOGDIE($ERRNO);
  my ($fileState, $fileAdded, $fileRemoved) = cmpJSON(\%queryHash, $jsonTemplate->decode($fileJSON));

  if ($fileState) {
    push @localChange, $_;
    $note = "$file changed: ".changeSummary($fileAdded,$fileRemoved)."\n";

    # Build JSON from the received query now that we need it
    $queryJSON = $jsonTemplate->encode(\%queryHash);
    # Write changes, error handling weird: https://rt.cpan.org/Public/Bug/Display.html?id=114341
    # Could test that this works?
    write_text($file, $queryJSON);

    push @AddedFiles, mapGroups($_, \@{$fileAdded});
    push @RemovedFiles, mapGroups($_, \@{$fileRemoved});
  }

  # Check if on-wiki records have changed
  my $wikiJSON = $contentStore{$_}[1];
  my ($wikiState, $wikiAdded, $wikiRemoved) = cmpJSON(\%queryHash, $jsonTemplate->decode($wikiJSON));

  # Check if everything is up-to-date onwiki, optional push otherwise
  if ($wikiState) {
    push @wikiChange, $_;
    my $summary = changeSummary($wikiAdded,$wikiRemoved);
    $note .= ($fileState ? 'and' : "$file").' needs updating on-wiki: '.$summary;

    push @AddedPages, mapGroups($_, \@{$wikiAdded});
    push @RemovedPages, mapGroups($_, \@{$wikiRemoved});

    if (!$opts{P}) {
      # Multifaceted and overly-verbose edit summaries are the best!
      my $editSummary = 'Update: '.$summary;
      # Include the count of the specific group
      my $count = scalar keys %queryHash;
      $editSummary .= " ($count total) ([[$userPage/crathighlighter|bot edit]])";
      $note .= '.  Pushing now... ';

      # Build JSON if not already done so above; only likely if the wiki is out
      # of date but the local files aren't for some reason
      $queryJSON ||= $jsonTemplate->encode(\%queryHash);
      $mw->edit({
		 action => 'edit',
		 assert => 'user',
		 title => $contentStore{$_}[0],
		 basetimestamp => $contentStore{$_}[2], # Avoid edit conflicts
		 text => $queryJSON,
		 summary => $editSummary
		});
      $note .= "$mw->{response}->{_msg}";
    } else {
      $note .= "\tSkipping push\n";
    }
  } elsif ($fileState) {
    $note .= "\tbut wiki already up-to-date";
  }

  # Log fully constructed message
  INFO($note) if $note;
}

# Clean up
$mw->logout();

# This final log is also used for confirming the prior run was successful.  This
# *could* be part of createNote, but currently all Log::Log4perl stuff is in
# this main file and not in the library.  That could (and perhaps will!) be
# changed, but for now this remains separate.
if (scalar @localChange + scalar @wikiChange) {
  INFO('No further updates needed');

  # I hate array referencing, somehow hashes are easier?!
  my @total = (
	       \@AddedFiles,
	       \@RemovedFiles,
	       \@AddedPages,
	       \@RemovedPages
	      );

  # Report final status via email.  Each item should already be logged above in the
  # main loop, this is just to trigger an email on changes when run via cron.
  # Probably not needed except to update the newsletter, but I like having the
  # updates.  Could put it behind a flag?
  print createEmail(\@localChange, \@wikiChange, \@total, $opts{P});
} else {
  INFO('No updates needed');
}

# Useful if used when running after a failure, to ensure success on follow-up
if ($opts{n}) {
  print "Run completed\n";
}


######## SUBROUTINES ########
# Handle logging in to the wiki, mainly ensuring we die nicely
sub mwLogin {
  my ($username, $password) = getConfig(shift);

  # Global, declared above
  $mw = MediaWiki::API->new({
			     api_url => 'https://en.wikipedia.org/w/api.php',
			     retries => '1',
			     retry_delay => '300', # Try again after 5 mins
			     on_error => \&dieNice,
			     use_http_get => '1' # use GET where appropriate
			    });
  $mw->{ua}->agent("$PROGRAM_NAME (".$mw->{ua}->agent.')');
  $mw->login({lgname => $username, lgpassword => $password});

  return $mw;
}
# Get relevant username/password combination from the config file, which
# consists of simple pairs of username and botpassword separated by a colon:
## Jimbo Wales:stochasticstring
# Config::General is easy but this is simple enough
sub getConfig {
  my $correctname = shift or LOGDIE('No username provided');

  my ($un, $pw);
  open my $rc, '<', '.crathighlighterrc' or LOGDIE($ERRNO);
  while (my $line = <$rc>) {
    chomp $line;
    ($un, $pw) = split /:/, $line;
    # Only accept the right user
    last if $un =~ /^$correctname@/;
  }
  close $rc or LOGDIE($ERRNO);

  # Catch wrong user if right user not actually provided
  LOGDIE('Wrong user provided') if $un !~ /^$correctname@/;

  return ($un, $pw);
}
# Nicer handling of some specific mediawiki errors, can be expanded using:
# - https://metacpan.org/release/MediaWiki-API/source/lib/MediaWiki/API.pm
# - https://www.mediawiki.org/wiki/API:Errors_and_warnings#Standard_error_messages
sub dieNice {
  my $code = $mw->{error}->{code};
  my $details = $mw->{error}->{details};

  # Avoid an elsif ladder.  Could `use experimental qw(switch)` but don't really
  # feel like it; this is probably more legible anyway
  my %codes = (
	       2 => 'HTTP access',
	       3 => 'API access',
	       4 => 'logging in',
	       5 => 'editing the page'
	      );
  my $message = $codes{$code} ? q{: }.$codes{$code} : q{};
  $message = 'MediaWiki error'.$message.":\n$code: $details";
  LOGDIE($message);
}


# Make sure the bot behaves nicely.  Both checks (disable page and user talk
# messages) are combined into one query since both will typically be checked, so
# might as well save a query!  The processing is handled by botShutoffs.
sub botQuery {
  # Only run the checks if it's a bot being a bot
  return if $botUser ne shift;

  my $botCheckQuery = {
		       action => 'query',
		       prop => 'revisions',
		       rvprop => 'content', # Don't care about much else
		       titles => $userPage.'/disable',
		       # Get user talk messages status
		       meta => 'userinfo',
		       uiprop => 'hasmsg',
		       format => 'json',
		       formatversion => 2
		      };
  my $botCheck = botShutoffs($mw->api($botCheckQuery));
  LOGDIE $botCheck if $botCheck;
  return;
}


# Bulk query for getting the current list of rights holders, plus an ad hoc
# check of the active/inactive list for ArbCom members.  Big subroutine that can
# probably be split up, although admittedly it all fits together here.
sub getCurrentGroups {
  # @rights doesn't include arbcom or steward at the moment since it's first
  # being used to build the query for determining local usergroups.  Steward
  # belongs to a different, global list (agu rather than au) and arbcom isn't
  # real.  They'll both be added in due course, although the arbcom list needs
  # separate getting.  suppress is used instead of oversight since that's the
  # actual group name now (ugh), but the page title is still at oversight.json,
  # so I replace that here and in findLocalGroupMembers.
  my @rights = qw (bureaucrat suppress checkuser interface-admin sysop);
  # Will store hash of editors for each group.  Basically JSON as hash of hashes.
  my %groupsData;

  ## List of each group (actually a list of users in any of the chosen groups with
  ## all of their respective groups)
  my $groupsQuery = {
		     action => 'query',
		     list => 'allusers|globalallusers',
		     augroup => (join q{|}, @rights),
		     auprop => 'groups',
		     aulimit => 'max',
		     agugroup => 'steward',
		     agulimit => 'max',
		     format => 'json',
		     formatversion => 2,
		     utf8 => '1' # Alaa friendly
		    };
  # JSON, technically a reference to a hash
  # $mw->list doesn't work with multiple lists???  Lame
  my $groupsReturn = $mw->api($groupsQuery);
  # Hash containing each list as a key, with the results as an array of hashes,
  # each hash containing the userid, user name, and (if requested) user groups
  my %groupsQuery = %{${$groupsReturn}{query}};

  # Need to store stewards for later since they get overwritten by the continue,
  # and it's faster/nicer to only process the (large) set of local groups once,
  # since it's by user, not by group.  Stewards are easy anyway.
  my $stewRef = $groupsQuery{globalallusers};

  # Local groups need a loop for processing who goes where, but there are a lot of
  # sysops, so we need to either get the bot flag or iterate over everyone
  my @localHashes = @{$groupsQuery{allusers}}; # Store what we've got, for now
  # If there's a continue item, then continue, by God!
  while (exists ${$groupsReturn}{continue}) { # avoid autovivification
    # Process the continue parameters
    # Probably shit if there's another group that needs continuing
    # FIXME && aufrom
    foreach (keys %{${$groupsReturn}{continue}}) {
      ${$groupsQuery}{$_} = ${${$groupsReturn}{continue}}{$_}; # total dogshit
    }

    # Resubmit new query, using old query + new continue, rewriting old data
    $groupsReturn = $mw->api($groupsQuery);

    # Overwrite original data, already stored in @localHashes and needed for
    # iteration in this loop.  Can I just merge? %h = (%a, %b) FIXME TODO
    %groupsQuery = %{${$groupsReturn}{query}};
    # Append the new stuff
    push @localHashes, @{$groupsQuery{allusers}};
  }

  # Go through each of the local groups and find the people (technically the
  # other way around)
  %groupsData = findLocalGroupMembers(\@localHashes, \@rights);

  # Stewards easy
  %{$groupsData{steward}} = findStewardMembers($stewRef);
  push @rights, qw (steward);

  # Get ArbCom.  Imperfect to rely upon this list being updated, but the Clerks
  # are proficient and timely, and ArbCom membership is high-profile enough that
  # this is updated quickly.  Previously, relied upon parsing
  # [[Template:Arbitration_committee_chart/recent]] but that had annoying edge
  # cases around December 30th and 31st, and is occasionally not updated as
  # timely as the "official" members list, the latter being enshrined in AC/C/P.
  my $acTemplate = 'Wikipedia:Arbitration Committee/Members';
  my $acMembers = $mw->get_page({title => $acTemplate})->{q{*}};

  $groupsData{arbcom} = findArbComMembers($acMembers);
  unshift @rights, qw (arbcom);

  # Rename suppress to oversight
  s/suppress/oversight/ for @rights;

  # Need to return references since we're doing hash and array
  return (\%groupsData, \@rights);
}


# Get the current content of each on-wiki page, so we can compare to see if
# there are any updates needed
sub getPageGroups {
  my @rights = @_;
  my @titles = map { $userPage.'/crathighlighter.js/'.$_.'.json' } @rights;

  # Could do this query with get_page but formatversion=2 makes things so much
  # easier to iterate over
  my $contentQuery = {
		      action => 'query',
		      prop => 'revisions',
		      rvprop => 'content|timestamp',
		      titles => (join q{|}, @titles),
		      format => 'json',
		      formatversion => 2
		     };
  # JSON, technically a reference to a hash
  my $contentReturn = $mw->api($contentQuery);
  return processFileData($contentReturn);
}


#### Usage statement ####
# Use POD or whatever?
# Escapes not necessary but ensure pretty colors
# Final line must be unindented?
sub usage {
  print <<"USAGE";
Usage: $PROGRAM_NAME [-PnLh]
      -P Don't push live to the wiki
      -n Print a message to STDOUT upon completion of a successful run.  Useful for notifying after a prior failure.
      -L Turn off all logging
      -h Print this message
USAGE
  exit;
}
