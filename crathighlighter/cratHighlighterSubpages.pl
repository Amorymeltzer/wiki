#!/usr/bin/env perl
# cratHighlighterSubpages.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Sync JSON lists for crathighlighter.js
# https://en.wikipedia.org/wiki/User:Amorymeltzer/crathighlighter
# Run regularly on toolforge as User:AmoryBot

use 5.036;
use English;

use Getopt::Long;

# Parse commandline options
my %opts = ();
GetOptions(\%opts, 'P', 'n', 'L', 'help' => \&usage);

# Get ready for local lib by finding out where this script is.  Also used
# elsewhere for logs and proper reading/writing of files
my $scriptDir;
use Cwd 'abs_path';
use File::Basename 'dirname';

BEGIN {
  $scriptDir = dirname abs_path __FILE__;
}

# Allow script to be run from elsewhere by prepending the local library to @INC
use lib $scriptDir.'/lib';
use AmoryBot::CratHighlighter qw(:all);

use Log::Log4perl qw(:easy);	# Maybe don't need easy FIXME TODO
use Log::Dispatch::Email::MailSend; # For email notifications
use JSON::MaybeXS;
use MediaWiki::API;
use File::Slurper qw(read_text write_text);

my $logfile = "$scriptDir/log.log";
# easy_init doesn't check the file is actually writable, so do it ourselves.
# Won't help if the whole filesystem is read-only, but whaddaya gonna do?  I
# don't think autodie covers file checks like -W?
-W $logfile or die $ERRNO;
# Set up logger.  The full options are straightforward but overly verbose, and
# easy mode (with stealth loggers) is succinct and sufficient.  Duplicated in
# gitSync.pl FIXME
my $infoLog = {level => $opts{L} ? $OFF : $INFO,
	       file  => ">>$logfile",
	       utf8  => 1,
	       # Datetime (level): message
	       layout => '%d{yyyy-MM-dd HH:mm:ss} (%p): %m{indent}%n'
	      };
# Only if not being run automatically, known thanks to CRON=1 in k8s envvars
my $traceLog = {level => $opts{L} ? $OFF : $TRACE,
		file  => 'STDOUT',
		# message
		layout => '%d - %m{indent}%n'
	       };
# Log::Log4perl->easy_init($ENV{CRON} ? $infoLog : ($infoLog, $traceLog));


# Okay:
# Info level sent all three (info fatal logdie)
# Fatal level sent just fatal and logdie
# Leave off from since unnecessary
my $emailConfig = qq(
    # Email notifications for changes
    log4perl.category          = INFO, EmailLogger
    log4perl.appender.EmailLogger           = Log::Dispatch::Email::MailSend
    log4perl.appender.EmailLogger.to        = tools.amorybot\@toolforge.org
    # log4perl.appender.EmailLogger.from   = tools.amorybot\@toolforge.org
    log4perl.appender.EmailLogger.subject   = CratHighlighter Updates-info3
    log4perl.appender.EmailLogger.layout    = PatternLayout
    log4perl.appender.EmailLogger.layout.ConversionPattern = %m{indent}%n
    log4perl.appender.EmailLogger.buffered  = 0
);

# Initialize both logging systems
Log::Log4perl->easy_init($ENV{CRON} ? $infoLog : ($infoLog, $traceLog));
Log::Log4perl::init(\$emailConfig);

# Get email logger
my $emailLogger = Log::Log4perl->get_logger("EmailLogger");

$emailLogger->info('info');
$emailLogger->fatal('fatal');
$emailLogger->logdie('logdie');
exit;


### User details
my $scriptName = 'cratHighlighterSubpages.pl';
# Define the bot and non-bot users, then check if this is being run on the
# toolforge grid.  It's a little added complexity but makes it easier for me to
# test API things without changing configs, etc.
my ($botUser, $userUser) = qw (AmoryBot Amorymeltzer);
# Kubernetes LOGNAME added manually via toolforge envvars
LOGDIE('Unable to determine user') if !$ENV{LOGNAME};
my $user = $ENV{LOGNAME} eq 'tools.amorybot.k8s' ? $botUser : $userUser;
# Get BotPassword for the given user.  It's stored in an environment variable,
# so need to be annoyingly roundabout.
my $envUsername = uc $user.'PW';
LOGDIE('Unable to get user login information') if !$ENV{$envUsername};
my $username = "$user\@$scriptName";


### Initialize API object, ensure we die nicely, log in, etc.
my $mw = buildMW(MediaWiki::API->new(), {agent => $username, error => \&dieNice});
$mw->login({lgname => $username, lgpassword => $ENV{$envUsername}});

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
my %pagesContent = getPageGroups(@{$groups});


### Main loop for each group
# These conveniently function as indicators as well as counters for number of
# files or pages changed, respectively
my (@localChange, @wikiChange);
# Hold all changes for later
my %changes;
# Template for generating JSON, sorted and prettyish
# Use decode_json and encode_json instead of encode and decode?  Gets annoying,
# and means using Encode to handle non-ascii script, I think?
# https://metacpan.org/pod/JSON::MaybeXS TODO FIXME
my $jsonTemplate = JSON::MaybeXS->new(canonical => 1, indent => 1, space_after => 1);
foreach (@{$groups}) {
  my %queryHash = %{${$groupsStore}{$_}};    # Just the specific rights hash we want
  my $queryJSON;                             # JSON will only be built from the query if there are any updates

  # Check if local records have changed.  Would be good to check this early,
  # just in case something is wrong.  Would be even better to just create the
  # damn file if need be.  Remind me why I care about the local files? TODO
  my $file = $_.'.json';

  # read_text and write_text don't actually return anything
  # (<https://rt.cpan.org/Public/Bug/Display.html?id=114341>) so should maybe
  # test them? FIXME TODO
  my $fileJSON = read_text("$scriptDir/$file") or LOGDIE($ERRNO);
  my ($fileState, $fileAdded, $fileRemoved) = cmpJSON(\%queryHash, $jsonTemplate->decode($fileJSON));

  my $note;
  if ($fileState) {
    push @localChange, $_;
    $note = "$file changed: ".changeSummary($fileAdded, $fileRemoved)."\n";

    # Build JSON from the received query now that we need it
    $queryJSON = $jsonTemplate->encode(\%queryHash);
    # Write changes, error handling weird: https://rt.cpan.org/Public/Bug/Display.html?id=114341
    # Could test that this works?
    write_text("$scriptDir/$file", $queryJSON);

    push @{$changes{addedFiles}},   mapGroups($_, \@{$fileAdded});
    push @{$changes{removedFiles}}, mapGroups($_, \@{$fileRemoved});
  }

  # Check if on-wiki records have changed
  my $wikiJSON = $pagesContent{$_}[1];
  my ($wikiState, $wikiAdded, $wikiRemoved) = cmpJSON(\%queryHash, $jsonTemplate->decode($wikiJSON));

  # Check if everything is up-to-date onwiki, optional push otherwise
  if ($wikiState) {
    push @wikiChange, $_;
    my $summary = changeSummary($wikiAdded, $wikiRemoved);
    $note .= ($fileState ? 'and' : "$file").' needs updating on-wiki: '.$summary;

    push @{$changes{addedPages}},   mapGroups($_, \@{$wikiAdded});
    push @{$changes{removedPages}}, mapGroups($_, \@{$wikiRemoved});

    if (!$opts{P}) {
      # Multifaceted and overly-verbose edit summaries are the best!
      my $editSummary = 'Update: '.$summary;
      # Include the count of the specific group
      my $count = scalar keys %queryHash;
      $editSummary .= " ($count total) ([[$userPage/crathighlighter|bot edit]])";
      $note        .= '.  Pushing now... ';

      # Build JSON if not already done so above; only likely if the wiki is out
      # of date but the local files aren't for some reason
      $queryJSON ||= $jsonTemplate->encode(\%queryHash);
      $mw->edit({action        => 'edit',
		 assert        => 'user',
		 title         => $pagesContent{$_}[0],
		 basetimestamp => $pagesContent{$_}[2],    # Avoid edit conflicts
		 text          => $queryJSON,
		 summary       => $editSummary
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

  # Report final status.  Each item should already be logged above in the main
  # loop, this is just to trigger an update on changes when run on the
  # kubernetes schedule.  Probably not needed, but I like having the updates.
  # Could put it behind a flag?
  say createEmail(\@localChange, \@wikiChange, \%changes, $opts{P});
  my $emailContent = createEmail(\@localChange, \@wikiChange, \%changes, $opts{P});
  $emailLogger->fatal($emailContent);
} else {
  INFO('No updates needed');
}

# Useful if used when running after a failure, to ensure success on follow-up
if ($opts{n}) {
  say 'Run completed';
}


######## SUBROUTINES ########
# Nicer handling of some specific mediawiki errors, can be expanded using:
# - https://metacpan.org/release/MediaWiki-API/source/lib/MediaWiki/API.pm
# - https://www.mediawiki.org/wiki/API:Errors_and_warnings#Standard_error_messages
sub dieNice {
  my $code    = $mw->{error}->{code};
  my $details = $mw->{error}->{details};

  # Avoid an elsif ladder.  Could `use experimental qw(switch)` but don't really
  # feel like it; this is probably more legible anyway
  my %codes = (2 => 'HTTP access',
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

  my $botCheckQuery = {action  => 'query',
		       prop    => 'revisions',
		       rvprop  => 'content',              # Don't care about much else
		       titles  => $userPage.'/disable',
		       rvslots => 'main',                 # rvslots is so dumb

		       # Get user talk messages status
		       meta          => 'userinfo',
		       uiprop        => 'hasmsg',
		       format        => 'json',
		       formatversion => 2
		      };
  # Note if warnings FIXME TODO
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
  # real.  They'll both be added in due course.  suppress is used instead of
  # oversight since that's the actual group name now (ugh), but the page title
  # is still at oversight.json, so I replace that here and in
  # findLocalGroupMembers.
  my @rights = qw (bureaucrat suppress checkuser interface-admin sysop);
  # Will store hash of editors for each group.  Basically JSON as hash of hashes.
  my %groupsData;

  # Get ArbCom.  Not ideal to rely upon the member list being updated, but the
  # Clerks are proficient and timely, and ArbCom membership is high-profile
  # enough that this is updated quickly.  Previously, relied upon parsing
  # [[Template:Arbitration_committee_chart/recent]] but that had annoying edge
  # cases around December 30th and 31st, and is occasionally not updated as
  # timely as the "official" members list, which is enshrined in AC/C/P.
  my $acTemplate = 'Wikipedia:Arbitration Committee/Members';

  ## List of each group (actually a list of users in any of the chosen groups
  ## with all of their respective groups).  $mw->list doesn't work with multiple
  ## lists, which is a drag, but we're getting the ArbCom template's revisions
  ## at the same time, so it's no real loss
  my $groupsQuery = {action        => 'query',
		     list          => 'allusers|globalallusers',
		     augroup       => (join q{|}, @rights),
		     auprop        => 'groups',
		     aulimit       => 'max',
		     agugroup      => 'steward',
		     agulimit      => 'max',
		     prop          => 'revisions',
		     rvprop        => 'content',
		     titles        => $acTemplate,
		     rvslots       => 'main',                      # rvslots is so dumb
		     format        => 'json',
		     formatversion => 2,
		     utf8          => '1'                          # Alaa and Torai friendly
		    };
  # JSON, technically a reference to a hash
  my $groupsReturn = $mw->api($groupsQuery);
  # Hash containing each list as a key, with the results as an array of hashes,
  # each hash containing the userid, user name, and (if requested) user groups
  my %groupsQuery = %{${$groupsReturn}{query}};

  # Need to store stewards for later since they get overwritten by the continue,
  # and it's faster/nicer to only process the (large) set of local groups once,
  # since it's by user, not by group.  Stewards are easy anyway.
  my $stewRef = $groupsQuery{globalallusers};

  # Likewise, needs to store the ArbCom data.  Could shunt this off to the sub
  # like botShutoffs or processPagesData, but I'd rather not save the test pages
  # as json.  Probably smarter, though. TODO
  my $acContent = $groupsQuery{pages}[0]->{revisions}[0]->{slots}->{main}->{content};


  # Local groups need a loop for processing who goes where, but there are a lot
  # of sysops, so we need to either get the bot flag or iterate over everyone.
  # In the meantime, store what we've got for now
  my @localHashes = @{$groupsQuery{allusers}};
  # If there's a continue item, then continue, by God!  Although it looks
  # generic, it's only set up to handle processing sysops afterward.
  while (exists ${$groupsReturn}{continue}) {    # avoid autovivification

    # Process the continue parameters
    foreach (keys %{${$groupsReturn}{continue}}) {
      ${$groupsQuery}{$_} = ${${$groupsReturn}{continue}}{$_};    # total dogshit
    }

    # Resubmit new query, using old query + new continue, rewriting old data
    $groupsReturn = $mw->api($groupsQuery);

    # Overwrite original data, already stored in @localHashes and needed for
    # iteration in this loop.  Can I just merge? %h = (%a, %b) FIXME TODO
    %groupsQuery = %{${$groupsReturn}{query}};
    # Append the new stuff
    push @localHashes, @{$groupsQuery{allusers}};
  }

  ## Now that we've got all the data stored properly, it's pretty
  ## straightforward to just go through 'em all!
  # Go through each local group and find the people (technically the other way
  # around)
  %groupsData = findLocalGroupMembers(\@localHashes, \@rights);
  # Stewards easy
  %{$groupsData{steward}} = findStewardMembers($stewRef);
  push @rights, qw (steward);
  # ArbCom too
  $groupsData{arbcom} = findArbComMembers($acContent);
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
  my @titles = map {$userPage.'/crathighlighter.js/'.$_.'.json'} @rights;

  # formatversion=2 makes things so nice to iterate over
  my $contentQuery = {action        => 'query',
		      prop          => 'revisions',
		      rvprop        => 'content|timestamp',
		      titles        => (join q{|}, @titles),
		      rvslots       => 'main',                 # rvslots is so dumb
		      format        => 'json',
		      formatversion => 2
		     };
  # JSON, technically a reference to a hash
  # Note if warnings FIXME TODO
  my $contentReturn = $mw->api($contentQuery);
  return processPagesData($contentReturn);
}


#### Usage statement ####
# Use POD or whatever?
# Escapes not necessary but ensure pretty colors
# Final line must be unindented?
sub usage {
  print <<"USAGE";
Usage: $PROGRAM_NAME [-PnLh]
      -P Don't push live to the wiki
      -n Send a message to STDOUT upon completion of a successful run.  Useful for notifying after a prior failure.
      -L Turn off all logging
      -h Show this message
USAGE
  exit;
}
