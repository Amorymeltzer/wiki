#!/usr/bin/env perl
# cratHighlighterSubpages.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Sync JSON lists for crathighlighter.js
# https://en.wikipedia.org/wiki/User:Amorymeltzer/crathighlighter
# Run via cron on toolforge as User:AmoryBot

use strict;
use warnings;
use diagnostics;

use Getopt::Std;
use FindBin;
use English qw(-no_match_vars); # Avoid regex speed penalty in perl <=5.18
use List::Util qw(uniq);

use Log::Log4perl qw(:easy);
use MediaWiki::API;
use File::Slurper qw(read_text write_text);
use JSON;

# Figure out if we're being run on the toolforge grid or not
my $tool = $ENV{LOGNAME} eq 'tools.amorybot';
# Likewise, if we're being run via cron, thanks to CRON=1 in crontab
my $cron = $ENV{CRON};

# Pop into this script's directory
my $scriptDir = $FindBin::Bin;
chdir "$scriptDir" or LOGDIE('Failed to change directory');

# Parse commandline options
my %opts = ();
getopts('hPNn', \%opts);
usage() if $opts{h};

# Set up logger
# FIXME TODO
my $logLocation = $tool ? "$ENV{HOME}/logs/tflog.log" : "$scriptDir/log.log";
# The full options are straightforward but overly verbose, and easy mode
# (with stealth loggers) is succinct and sufficient
my $infoLog =  { level  => $INFO,
		 file   => ">>$logLocation",
		 utf8   => 1,
		 # Datetime (level): message
		 layout => '%d{yyyy-MM-dd HH:mm:ss} (%p): %m{indent}%n' };
# Only if not being run via cron
my $traceLog = { level  => $TRACE,
		 file   => 'STDOUT',
		 # message
		 layout => '%d - %m{indent}%n' };
Log::Log4perl->easy_init($cron ? $infoLog : ($infoLog, $traceLog));


# Check and update repo before doing anything unsupervised, i.e. via cron
if ($cron) {
  require Git::Repository;
  gitCheck(Git::Repository->new());
}

# Initialize API object.  Get username/password combo, log in, etc.
my ($mw, $bot);
$mw = mwLogin();

# If it's the bot account, include a few checks for (emergency) shutoff
if ($tool) {
  botShutoffs();
}

# Template for generating JSON, sorted
my $jsonTemplate = JSON->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish


## Bulk queries: It's easier to do multiple queries but this is more polite
# @rights doesn't include arbcom or steward at the moment since it's first being
# used to build the query for determining local usergroups.  Steward belongs to
# a different, global list (agu rather than au) and arbcom isn't real.  They'll
# both be added in due course, although the arbcom list needs separate getting.
my @rights = qw (bureaucrat oversight checkuser interface-admin sysop);
# Will store hash of editors for each group.  Basically JSON
my %groupsStore;

### List of each group; actually a list of users in any of the groups with
### all of their respective groups
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
		   formatversion => 2, # Easier to iterate over
		   utf8 => '1'         # Alaa friendly
		  };
# JSON, technically a reference to a hash
# $mw->list doesn't work with multiple lists???  Lame
my $groupsReturn = $mw->api($groupsQuery);
# Hash containing each list as a key, with the results as an array of hashes,
# each hash containing the useris, user name, and (if requested) user groups
my %groupsQuery = %{${$groupsReturn}{query}};

# Stewards are "simple" thanks to map and simple (one-group) structure
%{$groupsStore{steward}} = map {$_->{name} => 1} @{$groupsQuery{globalallusers}};


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

# NOW we can loop through everyone and figure out what they've got
foreach my $i (0..scalar @localHashes - 1) {
  my %userHash = %{$localHashes[$i]};
  # Limit to the groups in question (I always forget how neat grep is)
  my @usersGroups = grep {/$localPerms/} @{$userHash{groups}};
  # Add to hash of hash
  foreach my $grp (@usersGroups) {
    $groupsStore{$grp}{$userHash{name}} = 1;
  }
}

# Get ArbCom.  Imperfect to rely upon the template being updated, but ArbCom
# membership is high-profile enough that in practice this is updated quickly
my $acTemplate = $mw->get_page({title => 'Template:Arbitration_committee_chart/recent'});
my $templateContent = $acTemplate->{q{*}};

# Find the diamonds in the rough
my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=gmtime;
$year += 1900;
# 0-padding
$mon = sprintf '%02d', $mon+1;
$mday = sprintf '%02d', $mday;
my $now = $year.q{-}.$mon.q{-}.$mday;
# For dumb template reasons, arbs are listed as ending terms on December
# 30th.  While unlikely, this means the list won't be accurate on the
# 31st, so just skip it.  Likewise, since we check that the date is
# greater than the current date to ensure that we catch retiring arbs, the
# 30th is no good as well.
last if $now =~ /-12-3[0|1]/;

# Build regex for parsing lines from the arbcom template
# https://en.wikipedia.org/wiki/Template:Arbitration_committee_chart/recent
my $dateCaptureRE = '(\d{2}\/\d{2}\/\d{4})';
my $userNameRE = '\[\[User:.*\|(.*)\]\]';
my $arbcomRE = 'from:'.$dateCaptureRE.' till:'.$dateCaptureRE.q{.*}.$userNameRE;

for (split /^/, $templateContent) {
  if (/$arbcomRE/) {
    my ($from,$till,$name) = ($1,$2,$3);
    $from =~ s/(\d{2})\/(\d{2})\/(\d{4})/$3-$1-$2/;
    $till =~ s/(\d{2})\/(\d{2})\/(\d{4})/$3-$1-$2/;
    if ($from le $now && $till gt $now) {
      $groupsStore{arbcom}{$name} = 1;
    }
  }
}

# Add stewards and arbcom, preserving order
push @rights, qw (steward);
unshift @rights, qw (arbcom);

### Content of each page
my @titles = map { $bot.'/crathighlighter.js/'.$_.'.json' } @rights;
my $allTitles = join q{|}, @titles;
my $contentQuery = {
		    action => 'query',
		    prop => 'revisions',
		    rvprop => 'content',
		    titles => $allTitles,
		    format => 'json',
		    formatversion => 2 # Easier to iterate over
		   };
# JSON, technically a reference to a hash
my $contentReturn = $mw->api($contentQuery);
# Stores page title, content, and last edited time in an array for each group
my %contentStore;
# This monstrosity results in an array where each item is an array of hashes:
## title     -> used to also snag the specific group used for hash key
## revisions -> array containing one item, which is a hash, which has keys:
### content   -> full page content
### timestamp -> time last edited
# Just awful.
my @pages = @{${${$contentReturn}{query}}{pages}};
foreach my $i (0..scalar @pages - 1) {
  my %page = %{$pages[$i]};
  my $userGroup = $page{title} =~ s/.*\.js\/(.+)\.json/$1/r;
  my @revisions = @{$page{revisions}};
  $contentStore{$userGroup} = [$page{title},${$revisions[0]}{content},${$revisions[0]}{timestamp}];
}


#### Main loop for each right
# These conveniently function as indicators as well as counters for number of
# files or pages changed, respectively
my ($localChange,$wikiChange) = (0,0);
my (@totAddedFiles, @totRemovedFiles, @totAddedPages, @totRemovedPages);
foreach (@rights) {
  my $note;
  my %queryHash = %{$groupsStore{$_}}; # Just the specific rights hash we want

  # Build JSON, needed regardless
  my $queryJSON = $jsonTemplate->encode(\%queryHash);

  # Check if local records have changed
  my $file = $_.'.json';
  my $fileJSON = read_text($file) or LOGDIE($ERRNO);
  my ($fileState, $fileAdded, $fileRemoved) = cmpJSON(\%queryHash, $jsonTemplate->decode($fileJSON));

  if ($fileState) {
    $localChange++;
    $note = "$file changed: ".changeSummary($fileAdded,$fileRemoved)."\n";
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
    $note .= ($fileState ? 'and' : "$file").' needs updating on-wiki'.$summary;

    push @totAddedPages, mapGroups($_, \@{$wikiAdded});
    push @totRemovedPages, mapGroups($_, \@{$wikiRemoved});

    if (!$opts{P}) {
      # Multifaceted and overly-verbose edit summaries are the best!
      my $editSummary = 'Update: '.$summary;
      # Include the count of the specific group
      my $count = scalar keys %queryHash;
      $editSummary .= " ($count total) (automatically via [[$bot/crathighlighter|script]])";

      $note .= '.  Pushing now... ';
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


# Also used for checking the previous run was successful
my $finalNote = $localChange + $wikiChange ? 'No further updates needed' : 'No updates needed';
INFO($finalNote);

# Report final status.  Each item should already be logged above in the main
# loop, this is just to trigger an email on changes when run via `cron`.
# Probably not needed long run, except to update the newsletter, but at least
# initially it's a good idea.
if ($localChange + $wikiChange) {
  my $updateNote = "CratHighlighter updates\n\n";

  # Include file/page code in first line? FIXME TODO

  # Local changes
  if ($localChange) {
    $updateNote .= "Files: $localChange updated\n";
    if (scalar @totAddedFiles) {
      $updateNote .= "\tAdded: ".oxfordComma(uniq @totAddedFiles)."\n";
    }
    if (scalar @totRemovedFiles) {
      $updateNote .= "\tRemoved: ".oxfordComma(uniq @totRemovedFiles)."\n";
    }
  }

  # Notify on pushed changes
  if ($wikiChange) {
    $updateNote .= 'Pages: $wikiChange ';
    if (!$opts{P}) {
      $updateNote .= "updated\n";
      if (scalar @totAddedPages) {
	$updateNote .= "\tAdded: ".oxfordComma(uniq @totAddedPages)."\n";
      }
      if (scalar @totRemovedPages) {
	$updateNote .= "\tRemoved: ".oxfordComma(uniq @totRemovedPages)."\n";
      }
    } else {
      $updateNote .= "not updated\n";
    }
  }

  print $updateNote;

  if (!$cron && !$opts{N}) {
    system '/opt/local/bin/terminal-notifier -message "Changes or updates made" -title "cratHighlighter"';
  }
}

# Only used if run after a failure
if ($opts{n}) {
  print "Run completed\n";
}


######## SUBROUTINES ########
# Check and update repo before doing anything risky
sub gitCheck {
  my $repo = shift;

  if (gitOnMaster($repo)) {
    LOGDIE('Not on master branch');
  } elsif (gitCleanStatus($repo)) {
    LOGDIE('Repository is not clean');
  }

  # All good, we can go ahead and check for new commits
  my $oldSha = $repo->run('rev-parse' => '--short', 'HEAD');
  # Pull, check for errors
  my $pull = $repo->command('pull' => '--rebase', '--quiet', 'origin', 'master');
  my @pullE = $pull->stderr->getlines();
  $pull->close();
  if (scalar @pullE) {
    LOGDIE(@pullE);
  } elsif (gitCleanStatus($repo) || gitOnMaster($repo)) {
    LOGDIE('Repository dirty after pull');
  }

  # All good, log if any new commits were pulled
  my $newSha = $repo->run('rev-parse' => '--short', 'HEAD');
  if ($oldSha ne $newSha) {
    INFO("Updated repo from $oldSha to $newSha");
  }
}
# These two are used above, and are rerun each time just to be extrasuperspecial
# sure.  Mis/abuses @_ rather than simply `shift`-ing.
sub gitOnMaster {
  return $_[0]->run('rev-parse' => '--abbrev-ref', 'HEAD') ne 'master';
}
sub gitCleanStatus {
  return scalar $_[0]->run(status => '--porcelain');
}

# Handle logging in to the wiki, mainly ensuring we die nicely
sub mwLogin {
  my ($username, $password) = getUserAndPass($tool ? 'AmoryBot' : 'Amorymeltzer');

  # Used globally to make edit summaries, page titles, etc. easier
  $bot = 'User:'.$username =~ s/@.*//r;

  # Global, declared above
  $mw = MediaWiki::API->new({
			     api_url => 'https://en.wikipedia.org/w/api.php',
			     on_error => \&dieNice,
			     use_http_get => '1' # use GET where appropriate
			    });
  $mw->{ua}->agent('cratHighlighterSubpages.pl ('.$mw->{ua}->agent.')');
  $mw->login({lgname => $username, lgpassword => $password});

  return $mw;
}
# Get relevant username/password combination from the config.  Config consists
# of simple pairs of username and botpassword separated by a colon:
# Jimbo Wales:stochasticstring
# Config::General is easy but this is so simple
sub getUserAndPass {
  my $correctname = shift;
  my ($un, $pw);
  open my $config, '<', '.crathighlighterrc' or LOGDIE($ERRNO);
  while (<$config>) {
    chomp;
    ($un, $pw) = split /:/;
    # Only accept the right user
    last if $un =~ /^$correctname@/;
  }
  close $config or LOGDIE($ERRNO);
  # Only accept the right user
  if ($un !~ /^$correctname@/) {
    LOGDIE('Wrong user provided');
  }

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
  my $message = q{: }.$codes{$code} // q{};
  $message = 'MediaWiki error'.$message.":\n$code: $details";
  LOGDIE($message);
}


# Make sure the bot behaves nicely; extra queries so as to simplify things, but
# in theory these could be combined.  Hell, all the queries could be combined!
# But that's dumb since this isn't exactly hammering the API.
sub botShutoffs {
  # Manual shutoff; confirm bot should actually run
  my $page = $mw->get_page({title => $bot.'/disable'});
  my $checkContent = $page->{q{*}};
  if (!$checkContent || $checkContent ne '42') {
    LOGDIE('DISABLED on-wiki');
  }

  # Automatic shutoff: user has talkpage messages
  my %userNotes = %{$mw->api({action => 'query', meta => 'userinfo', uiprop => 'hasmsg'})};
  if (exists $userNotes{query}{userinfo}{messages}) {
    LOGDIE("$bot has talkpage message(s))");
  }
}

# Compare query hash with a JSON object hash, return negated equality and
# arrays of added added and removed names from the JSON object
sub cmpJSON {
  my ($queryRef, $objectRef) = @_;

  my @qNames = sort keys %{$queryRef};
  my @oNames = sort keys %{$objectRef};

  my (@added, @removed);

  # Only if stringified arrays aren't equivalent
  my $state = "@qNames" ne "@oNames";
  if ($state) {
    # Check all names from the query first, will determine if anyone new
    # needs adding
    foreach (@qNames) {
      # Match in the other file
      if (!${$objectRef}{$_}) {
	push @added, $_;
      } else {
	# Don't check again
	delete ${$objectRef}{$_};
      }
    }

    # Whatever is left should be anyone that needs removing; @oNames is
    # unreliable after above
    @removed = sort keys %{$objectRef};
  }

  return ($state, \@added, \@removed);
}

# Write a summary of added/removed users from the provided array references.
# Uses oxfordComma below for proper grammar.  Used for the git commit entry as
# well as the basis for the on-wiki edit summary.
sub changeSummary {
  my ($addedRef,$removedRef) = @_;
  my $change = q{};

  if (scalar @{$addedRef}) {
    $change .= 'Added '.oxfordComma(@{$addedRef});
  }
  if (scalar @{$removedRef}) {
    $change .= '; ' if length $change;
    $change .= 'Removed '.oxfordComma(@{$removedRef});
  }

  return $change;
}

# Oxford comma
sub oxfordComma {
  my @list = @_;
  if (scalar @list < 3) {
    return join ' and ', @list;
  }
  my $end = pop @list;
  return join(', ', @list) . ", and $end";
}

# Map a marker of the group in question onto an array
sub mapGroups {
  my ($group, $usersRef) = @_;
  my %lookup = (
		arbcom            => 'AC',
		bureaucrat        => 'B',
		oversight         => 'OS',
		checkuser         => 'CU',
		'interface-admin' => 'IA',
		sysop             => 'SYS',
		steward           => 'SW'
	       );
  return map { $_." ($lookup{$group})" } @{$usersRef};
}


#### Usage statement ####
# Use POD or whatever?
# Escapes not necessary but ensure pretty colors
# Final line must be unindented?
sub usage {
  print <<"USAGE";
Usage: $PROGRAM_NAME [-hPNn]
      -P Don't push live to the wiki
      -N Don't send a message using the system notifier when there are any changes.  Never sent if run via cron.
      -n Print a message to STDOUT upon completion of a successful run.  Useful for notifying after a prior failure.
      -h Print this message
USAGE
  exit;
}
