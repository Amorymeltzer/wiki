#!/usr/bin/env perl
# gitSync by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Pull the latest from git repo

use 5.006;
use strict;
use warnings;
use English qw(-no_match_vars); # Avoid regex speed penalty in perl <=5.16

use Getopt::Long;

# Parse commandline options
my %opts = ();
GetOptions(\%opts, 'L', 'help' => \&usage);

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
use AmoryBot::CratHighlighter::GitUtils qw(:all);

use Log::Log4perl qw(:easy);

# Most of this is duplicated, should really avoid that FIXME TODO

my $logfile = "$scriptDir/log.log";
# easy_init doesn't check the file is actually writable, so do it ourselves.
# Won't help if the whole filesystem is read-only, but whaddaya gonna do?
-W $logfile or die $ERRNO;
# Set up logger.  The full options are straightforward but overly verbose, and
# easy mode (with stealth loggers) is succinct and sufficient.  Duplicated in
# cratHighlighterSubpages.pl
my $infoLog =  {
		level  => $opts{L} ? $OFF : $INFO,
		file   => ">>$logfile",
		utf8   => 1,
		# Datetime (level): message
		layout => '%d{yyyy-MM-dd HH:mm:ss} (%p): %m{indent}%n'
	       };
# Only if not being run automatically, known thanks to CRON=1 in k8s envvars
my $traceLog = {
		level  => $opts{L} ? $OFF : $TRACE,
		file   => 'STDOUT',
		# message
		layout => '%d - %m{indent}%n'
	       };
Log::Log4perl->easy_init($ENV{CRON} ? $infoLog : ($infoLog, $traceLog));


### Check and update repo before doing anything unsupervised
# Initiate git from the right place
my $repo = Git::Repository->new(work_tree => $scriptDir);

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
  exit;
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
  exit;
}

# Don't entirely know what gets us here, but it seems if there's an issue with
# GitHub itself staying up, it's possible to end up here.  Don't know that
# there's anything else to check or look for...
LOGDIE("Fetched and merged but SHAs are the same: $newSHA");



#### Usage statement ####
# Use POD or whatever?
# Escapes not necessary but ensure pretty colors
# Final line must be unindented?
sub usage {
  print <<"USAGE";
Usage: $PROGRAM_NAME [-Lh]
      -L Turn off all logging
      -h Print this message
USAGE
  exit;
}
