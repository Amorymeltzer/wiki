#!/usr/bin/env perl
# toolforgeHighlighter.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Sync subpages of crathighlighter.js via toolforge
# https://en.wikipedia.org/wiki/User:AmoryBot/crathighlighter

use strict;
use warnings;
use diagnostics;

use Getopt::Std;
use FindBin;
use English qw(-no_match_vars);
use Net::SMTP;

use Log::Log4perl qw(:easy);
use Git::Repository;
use MediaWiki::API;
use File::Slurper qw(read_text write_text);
use JSON;


my $scriptDir = $FindBin::Bin; # Directory of this script
chdir "$scriptDir" or emailNote('Failed to change directory');

# Parse commandline options
my %opts = ();
getopts('pc', \%opts);

# The full options are straightforward, but overly verbose when easy mode
# (and stealth loggers) is succinct and sufficient
Log::Log4perl->easy_init({ level    => exists $ENV{CRON} ? $TRACE : $INFO,
			   file     => ">>$ENV{HOME}/logs/tflog.log",
			   utf8     => 1,
			   layout   => '%d{yyyy-MM-dd HH:mm:ss} (%p): %m{indent}%n' },
			 { level    => $TRACE,
			   file     => 'STDOUT',
			   layout   => '%m{indent}%n' }
                        );

# Check and update repo before doing anything risky
my $repo = Git::Repository->new();
if (gitName() ne 'master') {
  emailNote('Not on master branch');
} elsif (gitStatus()) {
  emailNote('Repository is not clean');
} else {
  # Pull, check for errors
  my $pull = $repo->command('pull' => '--rebase', '--quiet', 'origin', 'master');
  my @pullE = $pull->stderr->getlines();
  $pull->close();
  if (scalar @pullE) {
    emailNote(@pullE);
  } elsif (gitName() ne 'master' || gitStatus()) {
    emailNote('Repository dirty after pull');
  }
}

# Config consists of just a single line with username and botpassword
# Jimbo Wales:stochasticstring
# Config::General is easy but this is so simple
my $config_file = '.tfcrathighlighterrc';
open my $config, '<', "$config_file" or emailNote($ERRNO);
chomp(my $line = <$config>);
my ($username, $password) = split /:/, $line;
close $config or emailNote($ERRNO);

# Only accept the right user
my $bot = 'AmoryBot';
if ($username =~ /^$bot@/) {
  $bot = 'User:'.$bot;
} else {
  emailNote('Wrong user provided');
}

# Initialize API object, log in
my $mw = MediaWiki::API->new({
			      api_url => 'https://en.wikipedia.org/w/api.php',
			      on_error => \&dieNice
			     });
$mw->{ua}->agent('tf-cratHighlighterSubpages.pl ('.$mw->{ua}->agent.')');
$mw->login({lgname => $username, lgpassword => $password});


# Manual shutoff; confirm bot should actually run
my $page = $mw->get_page({title => $bot.'/disable'});
my $checkContent = $page->{q{*}};
if (!$checkContent || $checkContent ne '42') {
  emailNote('DISABLED on-wiki');
}
# Automatic shutoff: user has talkpage messages
my %userNotes = %{$mw->api({action => 'query', meta => 'userinfo', uiprop => 'hasmsg'})};
if (exists $userNotes{query}{userinfo}{messages}) {
  emailNote("$bot has talkpage message(s))");
}

# Template for generating JSON, sorted
my $jsonTemplate = JSON->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish


## Bulk queries: It's easier to do multiple queries but this is more polite
# @rights doesn't include arbcom or steward at the moment since it's first
# being used to build the query for determining who has what usergroups.
# Steward belongs to a different, global list (agu rather than au) and arbcom
# isn't real.  They'll be added in due course, although the arbcom list still
# needs getting.
my @rights = qw (bureaucrat oversight checkuser interface-admin);
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

# Local groups need a loop for processing who goes where
my @localHashes = @{$groupsQuery{allusers}};
foreach my $i (0..scalar @localHashes - 1) {
  my %userHash = %{$localHashes[$i]};
  # Limit to the groups in question (I always forget how neat grep is)
  my @usersGroups = grep {/$localPerms/} @{$userHash{groups}};
  # Add to hash of hash
  foreach my $grp (@usersGroups) {
    $groupsStore{$grp}{$userHash{name}} = 1;
  }
}

# Stewards are "simple" thanks to map and simple (one-group) structure
%{$groupsStore{steward}} = map {$_->{name} => 1} @{$groupsQuery{globalallusers}};

# Add stewards and arbcom
push @rights, qw (steward arbcom);

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
# Stores page title, content and last edited time in an array for each right
my %contentStore;
# This monstrosity results in an array where each item is an array of hashes:
## title -> set use to set the content, maybe use as key in data hash
## revisions -> array containing one item, which is a hash, which has keys:
### content -> content
### timestamp -> last edited
# Just awful.
my @pages = @{${${$contentReturn}{query}}{pages}};
foreach my $i (0..scalar @pages - 1) {
  my %page = %{$pages[$i]};
  my $title = $page{title} =~ s/.*\.js\/(.+)\.json/$1/r;
  my @revisions = @{$page{revisions}};
  my $content = ${$revisions[0]}{content};
  my $timestamp = ${$revisions[0]}{timestamp};
  $contentStore{$title} = [$page{title},$content,$timestamp];
}


# Build abbreviation hash: slurp to string, split, assign (simper than loop).
# Also stores commit message.  Only used if -c but want global
my %abbrevs;
if ($opts{c}) {
  %abbrevs = split /\s+/, do { local $RS=undef; <DATA> };
  $abbrevs{message} = "cratHighlighterSubpages: Update\n";
}

#### Main loop for each right
my ($localChange,$wikiChange) = (0,0);
foreach (@rights) {
  my (%queryHash, $note);

  my $file = $_.'.json';
  my $wiki = $_.'.wiki';

  # ArbCom isn't a real group so its membership couldn't be queried above.
  # This doesn't strictly need to be in the loop here, but no reason not to.
  if (/arbcom/) {
    # Imperfect, relies upon the template being updated, but ArbCom membership
    # is high-profile enough that it will likely be updated quickly
    my $acTemplate = $mw->get_page({title => 'Template:Arbitration_committee_chart/recent'});
    my $content = $acTemplate->{q{*}};

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
    for (split /^/, $content) {
      if (/from:(\d{2}\/\d{2}\/\d{4}) till:(\d{2}\/\d{2}\/\d{4}).*\[\[User:.*\|(.*)\]\]/) {
	my ($from,$till,$name) = ($1,$2,$3);
	$from =~ s/(\d{2})\/(\d{2})\/(\d{4})/$3-$1-$2/;
	$till =~ s/(\d{2})\/(\d{2})\/(\d{4})/$3-$1-$2/;
	if ($from le $now && $till gt $now) {
	  $queryHash{$name} = 1;
	}
      }
    }
  } else {
    %queryHash = %{$groupsStore{$_}};
  }

  # Build JSON, needed regardless
  my $queryJSON = $jsonTemplate->encode(\%queryHash);

  # Check if local records have changed
  my $fileJSON = read_text($file);
  my ($fileState, $fileAdded, $fileRemoved) = cmpJSON(\%queryHash, $jsonTemplate->decode($fileJSON));

  if ($fileState) {
    $localChange = 1;
    $note = "$file changed\n";
    # Write changes
    write_text($file, $queryJSON);

    # Stage, build edit summary
    if ($opts{c}) {
      my $add = $repo->command(add => "*$file");
      my @addError = $add->stderr->getlines();
      $add->close;
      emailNote(@addError) if scalar @addError;

      my $commitMessage = "\n$abbrevs{$_}";
      $commitMessage .= buildSummary($fileAdded,$fileRemoved);
      $abbrevs{message} .= $commitMessage;
    } else {
      $note .= "\tSkipping commit\n";
    }
  }

  # Check if on-wiki records have changed
  my $wikiJSON = $contentStore{$_}[1];
  my ($wikiState, $wikiAdded, $wikiRemoved) = cmpJSON(\%queryHash, $jsonTemplate->decode($wikiJSON));

  # Check if everything is up-to-date onwiki, optional push otherwise
  if ($wikiState) {
    $wikiChange = 1;
    $note .= ($fileState ? 'but' : "$file").' needs updating on-wiki.';

    if ($opts{p}) {
      my $editSummary = 'Update'.buildSummary($wikiAdded,$wikiRemoved);
      $editSummary .=" (automatically via [[$bot/crathighlighter|script]])";
      my $timestamp = $contentStore{$_}[2];

      $note .= " Pushing now...\n";
      $mw->edit({
		 action => 'edit',
		 assert => 'user',
		 title => $contentStore{$_}[0],
		 basetimestamp => $timestamp, # Avoid edit conflicts
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

  # Log final message
  INFO($note) if $note;
}

if (!$localChange && !$wikiChange) {
  # LOGEXIT is FATAL (same as LOGDIE except no extra die message)
  INFO('No updates needed');
  exit;
}

my $niceEmail;
# Autocommit changes
if ($localChange && $opts{c}) {
  my $add = $repo->command(commit => '-m', "$abbrevs{message}");
  my @addE = $add->stderr->getlines();
  $add->close;
  if (scalar @addE) {
    emailNote(@addE);
  } else {
    my $push = $repo->command(push => '--quiet', 'origin', 'master');
    my @pushE = $push->stderr->getlines();
    $push->close;
    if (scalar @pushE) {
      emailNote(@pushE);
    } else {
      $niceEmail = 'Changes committed and pushed';
    }
  }
}

# Notify on pushed changes
if ($wikiChange && $opts{p}) {
  if ($niceEmail) {
    $niceEmail .= '; ';
  }
  $niceEmail .= 'On-wiki pages updated';
}

emailNote($niceEmail, 'safe') if $niceEmail;
# testing
print "Done!\n";
TRACE('Trace done');
INFO('Info done');


#### SUBROUTINES
## Nicer handling of errors
# Send an email and die on fatal errors
sub emailNote {
  my ($message,$safe) = @_;
  chomp $message;

  my $smtp = Net::SMTP->new('mail.tools.wmflabs.org');
  $smtp->mail('amorymeltzer@tools.wmflabs.org');
  $smtp->to('amorymeltzer@tools.wmflabs.org');

  $smtp->data;
  $smtp->datasend($safe ? 'Toolforge updated' : 'Toolforge error');
  $smtp->datasend ("\n".$message);

  $smtp->dataend;
  $smtp->quit;

  if (!$safe) {
    LOGDIE($message);
  }
}

# Some specific mediawiki errors, can be expanded using:
## https://metacpan.org/release/MediaWiki-API/source/lib/MediaWiki/API.pm
## https://www.mediawiki.org/wiki/API:Errors_and_warnings#Standard_error_messages
sub dieNice {
  my $code = $mw->{error}->{code};
  my $details = $mw->{error}->{details};
  my $message = 'MediaWiki error';
  if ($code == 4) {
    $message .= ' logging in';
  } elsif ($code == 5) {
    $message .= ' editing the page';
  }
  $message .= ":\n$code: $details";
  emailNote($message);
}


# Git checking
sub gitName {
  return $repo->run('rev-parse' => '--abbrev-ref', 'HEAD');
}
sub gitStatus {
  return scalar $repo->run(status => '--porcelain');
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

# Create a commit/edit summary from the array references of added/removed
# usernames.  Uses oxfordComma below for proper grammar
sub buildSummary {
  my ($addedRef,$removedRef) = @_;
  my $change = q{};

  if (scalar @{$addedRef}) {
    $change .= 'Added '.oxfordComma(@{$addedRef});
  }
  if (scalar @{$removedRef}) {
    $change .= '; ' if length $change;
    $change .= 'Removed '.oxfordComma(@{$removedRef});
  }
  $change = ' ('.$change.')' if $change; # Preferred format for both -p and -c

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


## The lines below do not represent Perl code, and are not examined by the
## compiler.  Rather, they are used by %abbrevs to build nice commit messages.
__DATA__
arbcom AC
  bureaucrat B
  checkuser CU
  interface-admin IA
  oversight OS
  steward SW
