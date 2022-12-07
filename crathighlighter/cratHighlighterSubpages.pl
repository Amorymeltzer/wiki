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
use FindBin qw($Bin);
use List::Util qw(uniqstr);

use JSON::MaybeXS;
use Log::Log4perl qw(:easy);
use MediaWiki::API;
use File::Slurper qw(read_text write_text);

# Allows script to be run from elsewhere by prepending the local library to
# @INC.  Would be nice not to rely on FindBin again... FIXME TODO
use lib $Bin.'/lib';
use AmoryBot::CratHighlighter qw(processFileData findLocalGroupMembers findArbComMembers cmpJSON changeSummary oxfordComma mapGroups);

# Parse commandline options
my %opts = ();
GetOptions(\%opts, 'P', 'n', 'help|h|H' => \&usage);

# Figure out where this script is and if it's being run on the toolforge grid
my ($scriptDir, $tool) = ($Bin, $ENV{LOGNAME} eq 'tools.amorybot');

# Set up logger.  The full options are straightforward but overly verbose, and
# easy mode (with stealth loggers) is succinct and sufficient.  Duplicated in
# gitSync.pl
my $infoLog =  { level  => $INFO,
		 file   => ">>$scriptDir/log.log",
		 utf8   => 1,
		 # Datetime (level): message
		 layout => '%d{yyyy-MM-dd HH:mm:ss} (%p): %m{indent}%n' };
# Only if not being run via cron, known thanks to CRON=1 in crontab
my $traceLog = { level  => $TRACE,
		 file   => 'STDOUT',
		 # message
		 layout => '%d - %m{indent}%n' };
Log::Log4perl->easy_init($ENV{CRON} ? $infoLog : ($infoLog, $traceLog));


# Used globally, set through various subroutines
my ($mw, $bot);
### Initialize API object.  Get username/password combo, log in, etc.
$mw = mwLogin({username => $tool ? 'AmoryBot' : 'Amorymeltzer'});

### If it's the bot account, include a few checks for (emergency) shutoff
botShutoffs($tool);

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
my ($localChange,$wikiChange) = (0,0);
my (@totAddedFiles, @totRemovedFiles, @totAddedPages, @totRemovedPages);
# Template for generating JSON, sorted
# Make into hashref? https://metacpan.org/pod/JSON::MaybeXS#new FIXME TODO
my $jsonTemplate = JSON->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish
foreach (@{$groups}) {
  my $note;
  my %queryHash = %{${$groupsStore}{$_}}; # Just the specific rights hash we want
  my $queryJSON; # JSON will only be built from the query if there are any updates

  # Check if local records have changed
  my $file = $_.'.json';
  my $fileJSON = read_text($file) or LOGDIE($ERRNO);
  my ($fileState, $fileAdded, $fileRemoved) = cmpJSON(\%queryHash, $jsonTemplate->decode($fileJSON));

  if ($fileState) {
    $localChange++;
    $note = "$file changed: ".changeSummary($fileAdded,$fileRemoved)."\n";

    # Build JSON from the received query now that we need it
    $queryJSON = $jsonTemplate->encode(\%queryHash);
    # Write changes, error handling weird: https://rt.cpan.org/Public/Bug/Display.html?id=114341
    write_text($file, $queryJSON);

    push @totAddedFiles, mapGroups($_, \@{$fileAdded});
    push @totRemovedFiles, mapGroups($_, \@{$fileRemoved});
  }

  # Check if on-wiki records have changed
  my $wikiJSON = $contentStore{$_}[1];
  my ($wikiState, $wikiAdded, $wikiRemoved) = cmpJSON(\%queryHash, $jsonTemplate->decode($wikiJSON));

  # Check if everything is up-to-date onwiki, optional push otherwise
  if ($wikiState) {
    $wikiChange++;
    my $summary = changeSummary($wikiAdded,$wikiRemoved);
    $note .= ($fileState ? 'and' : "$file").' needs updating on-wiki: '.$summary;

    push @totAddedPages, mapGroups($_, \@{$wikiAdded});
    push @totRemovedPages, mapGroups($_, \@{$wikiRemoved});

    if (!$opts{P}) {
      # Multifaceted and overly-verbose edit summaries are the best!
      my $editSummary = 'Update: '.$summary;
      # Include the count of the specific group
      my $count = scalar keys %queryHash;
      $editSummary .= " ($count total) (automatically via [[$bot/crathighlighter|script]])";
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

# This final log is also used for confirming the prior run was successful
INFO($localChange + $wikiChange ? 'No further updates needed' : 'No updates needed');

# Report final status.  Each item should already be logged above in the main
# loop, this is just to trigger an email on changes when run via cron.  Probably
# not needed except to update the newsletter, but I like having the updates.
# Could put it behind a flag?
if ($localChange + $wikiChange) {
  my $updateNote = "CratHighlighter updates\n\n";

  # Include file/page code in first line? FIXME TODO
  # Might need to redo handling of totAdded*, mapGroups, etc.

  # Local changes
  if ($localChange) {
    $updateNote .= "Files: $localChange updated\n";
    if (scalar @totAddedFiles) {
      $updateNote .= "\tAdded: ".oxfordComma(uniqstr @totAddedFiles)."\n";
    }
    if (scalar @totRemovedFiles) {
      $updateNote .= "\tRemoved: ".oxfordComma(uniqstr @totRemovedFiles)."\n";
    }
  }

  # Notify on pushed changes
  if ($wikiChange) {
    $updateNote .= "Pages: $wikiChange ";
    if (!$opts{P}) {
      $updateNote .= "updated\n";
      if (scalar @totAddedPages) {
	$updateNote .= "\tAdded: ".oxfordComma(uniqstr @totAddedPages)."\n";
      }
      if (scalar @totRemovedPages) {
	$updateNote .= "\tRemoved: ".oxfordComma(uniqstr @totRemovedPages)."\n";
      }
    } else {
      $updateNote .= "not updated\n";
    }
  }

  print $updateNote;
}

# Useful if used when running after a failure, to ensure success on follow-up
if ($opts{n}) {
  print "Run completed\n";
}


######## SUBROUTINES ########
# Handle logging in to the wiki, mainly ensuring we die nicely
sub mwLogin {
  # Hashref holding configuration options
  my $config = getConfig(shift);

  my $username = ${$config}{username};
  my $password = ${$config}{password};

  # Used globally to make edit summaries, page titles, etc. easier
  $bot = 'User:'.$username =~ s/@.*//r;

  # Global, declared above
  $mw = MediaWiki::API->new({
			     api_url => "${$config}{url}/w/api.php",
			     retries => '1',
			     retry_delay => '300', # Try again after 5 mins
			     on_error => \&dieNice,
			     use_http_get => '1' # use GET where appropriate
			    });
  # FIXME TODO Rename to just cratHighlighter
  $mw->{ua}->agent('cratHighlighterSubpages.pl ('.$mw->{ua}->agent.')');
  $mw->login({lgname => $username, lgpassword => $password});

  return $mw;
}
# Process configuration options, including specific API variables and getting
# relevant username/password combination from the config file.  Config consists
# of simple pairs of username and botpassword separated by a colon:
# Jimbo Wales:stochasticstring
# Config::General is easy but this is simple enough
sub getConfig {
  # Hashref holding configuration options
  my $config = shift;
  # Ensure full config
  LOGDIE('No username provided') if ! defined ${$config}{username};

  ${$config}{lang} ||= 'en';
  ${$config}{family} ||= 'wikipedia';
  ${$config}{url} ||= "https://${$config}{lang}.${$config}{family}.org";
  # Just in case
  my $trail = substr ${$config}{url}, -1;
  chop ${$config}{url} if $trail eq q{/};

  # Pop into this script's directory, mostly so config file access is easy
  # Unnecessary? FIXME TODO
  if (${$config}{rcdir}) {
    ${$config}{rcdir} = $scriptDir.q{/}.${$config}{rcdir};
  } else {
    ${$config}{rcdir} = $scriptDir;
  }
  chdir ${$config}{rcdir} or LOGDIE('Failed to change directory');

  my $correctname = ${$config}{username};
  my ($un, $pw);
  open my $rc, '<', '.crathighlighterrc' or LOGDIE($ERRNO);
  while (my $line = <$rc>) {
    chomp $line;
    ($un, $pw) = split /:/, $line;
    # Only accept the right user
    last if $un =~ /^$correctname@/;
  }
  close $rc or LOGDIE($ERRNO);
  # Only accept the right user
  # Duplicative? FIXME TODO
  if ($un !~ /^$correctname@/) {
    LOGDIE('Wrong user provided');
  }
  ${$config}{username} = $un;
  ${$config}{password} = $pw;

  return $config;
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


# Make sure the bot behaves nicely.  Slightly more involved since the two checks
# are combined into one query, but in practice both of these are likely to be
# run, so might as well save a query, and it's not so bad comparatively!
sub botShutoffs {
  return if ! shift;
  my $botCheckQuery = {
		       action => 'query',
		       prop => 'revisions',
		       rvprop => 'content', # Don't care about much else
		       titles => $bot.'/disable',
		       # Get user talk messages status
		       meta => 'userinfo',
		       uiprop => 'hasmsg',
		       format => 'json',
		       formatversion => 2
		      };
  my $botCheckReturnQuery = $mw->api($botCheckQuery)->{query};
  # Manual shutoff; confirm bot should actually run
  # Arrows means no (de)referencing
  my $checkContent = $botCheckReturnQuery->{pages}[0]->{revisions}[0]->{content};
  if (!$checkContent || $checkContent ne '42') {
    LOGDIE('DISABLED on-wiki');
  }

  # Automatic shutoff: user has talkpage messages.  Unlikely as it redirects to
  # my main talk page, which I *don't* want to be an autoshutoff.
  my $userNotes = $botCheckReturnQuery->{userinfo}->{messages};
  if ($userNotes) {
    LOGDIE("$bot has talkpage message(s))");
  }
}


# Bulk query for getting the current list of rights holders, plus an ad hoc
# check of the active/inactive list for ArbCom members.  Big subroutine that can
# probably be split up, although admittedly it all fits together here.
sub getCurrentGroups {
  # @rights doesn't include arbcom or steward at the moment since it's first being
  # used to build the query for determining local usergroups.  Steward belongs to
  # a different, global list (agu rather than au) and arbcom isn't real.  They'll
  # both be added in due course, although the arbcom list needs separate getting.
  my @rights = qw (bureaucrat suppress checkuser interface-admin sysop);
  # Will store hash of editors for each group.  Basically JSON as hash of hashes.
  my %groupsData;

  ## List of each group (actually a list of users in any of the chosen groups with
  ## all of their respective groups).  $localPerms is also used for a grep later.
  my $localPerms = join q{|}, @rights;
  my $groupsQuery = {
		     action => 'query',
		     list => 'allusers|globalallusers',
		     augroup => $localPerms,
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
  # each hash containing the useris, user name, and (if requested) user groups
  my %groupsQuery = %{${$groupsReturn}{query}};

  # Stewards are "simple" thanks to map and simple (one-group) structure
  # Make into a subroutine? FIXME TODO
  %{$groupsData{steward}} = map {$_->{name} => 1} @{$groupsQuery{globalallusers}};
  push @rights, qw (steward);


  # Local groups need a loop for processing who goes where, but there are a lot of
  # sysops, so we need to either get the bot flag or iterate over everyone
  my @localHashes = @{$groupsQuery{allusers}}; # Store what we've got, for now
  # If there's a continue item, then continue, by God!
  while (exists ${$groupsReturn}{continue}) { # avoid autovivification
    # Process the continue parameters
    # Probably shit if there's another group that needs continuing
    # FIXME TODO && aufrom
    foreach (keys %{${$groupsReturn}{continue}}) {
      ${$groupsQuery}{$_} = ${${$groupsReturn}{continue}}{$_}; # total dogshit
    }

    # Resubmit new query, using old query
    $groupsReturn = $mw->api($groupsQuery);

    # Overwrite original data, already stored in @localHashes and needed for
    # iteration in this loop
    %groupsQuery = %{${$groupsReturn}{query}};
    # Append the new stuff
    push @localHashes, @{$groupsQuery{allusers}};
  }

  findLocalGroupMembers(\@localHashes, $localPerms, \%groupsData);

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
  my @titles = map { $bot.'/crathighlighter.js/'.$_.'.json' } @rights;
  my $allTitles = join q{|}, @titles;

  # Could do this query with get_page but formatversion=2 makes things so much
  # easier to iterate over
  my $contentQuery = {
		      action => 'query',
		      prop => 'revisions',
		      rvprop => 'content',
		      titles => $allTitles,
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
Usage: $PROGRAM_NAME [-hPn]
      -P Don't push live to the wiki
      -n Print a message to STDOUT upon completion of a successful run.  Useful for notifying after a prior failure.
      -h Print this message
USAGE
  exit;
}
