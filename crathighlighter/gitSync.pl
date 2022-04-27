#!/usr/bin/env perl
# gitSync by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Pull the latest from git repo

use strict;
use warnings;
use English qw(-no_match_vars); # Avoid regex speed penalty in perl <=5.16

use FindBin qw($Bin);

use Log::Log4perl qw(:easy);
use Git::Repository;


# Most of this is duplicated, should really avoid that FIXME TODO

# Figure out where this script is
my $scriptDir = $Bin;

# Set up logger
# The full options are straightforward but overly verbose, and easy mode
# (with stealth loggers) is succinct and sufficient
my $infoLog =  { level  => $INFO,
		 file   => ">>$scriptDir/log.log",
		 utf8   => 1,
		 # Datetime (level): message
		 layout => '%d{yyyy-MM-dd HH:mm:ss} (%p): %m{indent}%n' };
# Only if not being run via cron
my $traceLog = { level  => $TRACE,
		 file   => 'STDOUT',
		 # message
		 layout => '%d - %m{indent}%n' };
Log::Log4perl->easy_init($ENV{CRON} ? $infoLog : ($infoLog, $traceLog));

# Pop into this script's directory, mostly so file access is simplified
chdir "$scriptDir" or LOGDIE('Failed to change directory');


### Check and update repo before doing anything unsupervised, i.e. via cron
gitCheck();

### SUBROUTINES
sub gitCheck {
  my $repo = Git::Repository->new();

  if (gitCleanStatus($repo)) {
    LOGDIE('Repository is not clean');
  } elsif (gitOnMain($repo)) {
    LOGDIE('Not on main branch');
  }

  # Check for any upstream updates using fetch-then-merge, not pull
  # https://longair.net/blog/2009/04/16/git-fetch-and-merge/
  # Not quiet since want number of lines
  my $fetch = $repo->command('fetch' => 'origin', 'main');
  my @fetchE = $fetch->stderr->getlines();
  $fetch->close();
  # Not a great way of confirming the results, but fetch is annoyingly
  # unporcelain and this obviates the need for an additional status command.
  # Two lines means no updates were fetched so we don't need to act further.
  if (scalar @fetchE <= 2) {
    return;
  }

  # Now that we've fetched the updates, we can go ahead and merge them in
  my $oldSHA = gitSHA($repo);
  my $merge = $repo->command('merge' => '--quiet', 'origin/main');
  my @mergeE = $merge->stderr->getlines();
  $merge->close();
  if (scalar @mergeE) {
    LOGDIE(@mergeE);
  } elsif (gitCleanStatus($repo) || gitOnMain($repo)) { # Just to be safe
    LOGDIE('Repository dirty after pull');
  }

  # All good, log that new commits were pulled
  my $newSHA = gitSHA($repo);
  if ($oldSHA ne $newSHA) {
    INFO("Updated repo from $oldSHA to $newSHA");
    return;
  }

  # Don't entirely know what gets us here, but it seems if there's an issue with
  # GitHub itself staying up, it's possible to end up here.  Not sure what to
  # check for that or what errors to go after... FIXME TODO
  LOGDIE("Fetched and merged but SHAs are the same: $newSHA");
}
# These all mis/abuse @_ for brevity, rather than merely `shift`-ing
sub gitOnMain {
  return $_[0]->run('rev-parse' => '--abbrev-ref', 'HEAD') ne 'main';
}
sub gitCleanStatus {
  return scalar $_[0]->run(status => '--porcelain');
}
sub gitSHA {
  return scalar $_[0]->run('rev-parse' => '--short', 'HEAD');
}