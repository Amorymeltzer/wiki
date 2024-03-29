#!/usr/bin/env perl
# push.pl by Amory Meltzer
# Push new version live to my userspace

use 5.010;
use strict;
use warnings;
use diagnostics;

use English qw(-no_match_vars);
use utf8;

use Config::General qw(ParseConfig);
use FindBin;
use Git::Repository;
use MediaWiki::API;
use File::Slurper qw(read_text);
use Term::ANSIColor;

my %conf;
my $config_file = '.updatemodernrc';
%conf = ParseConfig($config_file) if -e -r $config_file;

# Checks
if (!exists $conf{username} || !exists $conf{password}) {
  print colored ['red'], "Username or password not found, quitting\n";
  exit 1;
}
# Ensure we've only got one item for each config key
foreach my $key (sort keys %conf) {
  if (ref($conf{$key}) eq 'ARRAY') {
    print colored ['red'], "Duplicate config found for $key, quitting\n";
    exit 1;
  }
}

# Open git handler
my $cwd = $FindBin::Bin;        # Directory of this script
my $repo = Git::Repository->new();

# Open API and log in before anything else
my $mw = MediaWiki::API->new({
                              api_url => 'https://en.wikipedia.org/w/api.php'
                             });
$mw->{ua}->agent('Amorymeltzer/push.pl ('.$mw->{ua}->agent.')');
$mw->login({lgname => $conf{username}, lgpassword => $conf{password}});


# Sigh, should probably combine these? FIXME TODO
# Just map tho FIXME TODO
my @titles;
# Stupid annoyingness to deal with _ to space shit
my %lookup;
foreach my $file (getFiles()) {
  # Hmmm: my $page = 'User:Amorymeltzer/'.$file =~ s/\s+//rg; TODO
  $file =~ s/\s+//g;
  my $page = 'User:Amorymeltzer/'.$file;
  # sigh
  $lookup{$page} = $file;

  # Add to query
  push @titles, $page;
}

# Get old pages' content, for comparison
my %query = (
             action => 'query',
             prop => 'revisions',
             rvprop => 'content|timestamp|comment',
             rvslots => 'main', # rvslots is so dumb
             format => 'json',
             formatversion => 2
            );
$query{titles} = join q{|}, @titles;
my $response = $mw->api(\%query) or die $mw->{error}->{code}.': '.$mw->{error}->{details};

# Stupid lookup fix for page normalization from _ to space
# Use map? FIXME TODO
foreach my $norm (@{$response->{query}->{normalized}}) {
  $lookup{$norm->{to}} = $norm->{from} =~ s/^User:Amorymeltzer\///r;
}

# Go through 'em all!
foreach my $page (@{$response->{query}->{pages}}) {
  my $title = $page->{title};
  if ($page->{missing}) {
    print colored ['red'], "$title does not exist\n";
  } else {
    my $file = $lookup{$title};
    # Push, making sure only valid files are entered
    print "Pushing $file...\n";
    my $rev = $page->{revisions}[0];

    my $wikiText = $rev->{slots}->{main}->{content}."\n"; # MediaWiki doesn't have trailing newlines

    my $text = read_text($file);
    if ($text eq $wikiText) {
      print colored ['blue'], "\tNo changes needed, skipping\n";
    } else {
      my $timestamp = $rev->{timestamp};
      my $summary = buildEditSummary($title, $file, $rev->{comment});
      $mw->edit({
                 action => 'edit',
                 assert => 'user',
                 title => $title,
                 basetimestamp => $timestamp, # Avoid edit conflicts
                 text => $text,
                 summary => $summary
                }) || die "\tError editing the page $title: $mw->{error}->{code}: $mw->{error}->{details}\n";
      my $return = $mw->{response};

      if ($return->{_msg} eq 'OK') {
        print colored ['green'], "\t$file successfully pushed to $title\n";
      } else {
        print colored ['red'], "\tError pushing $file: $mw->{error}->{code}: $mw->{error}->{details}\n";
      }
    }
  }
}


# Make sure only valid files are entered
sub getFiles {
  if (@ARGV != 0) {
    my %defaultFiles;
    while (<DATA>) {
      s/\s+//g;
      $defaultFiles{$_} = 1;
    }

    if ($ARGV[0] eq 'all' || $ARGV[0] eq 'All') {
      return keys %defaultFiles;
    } else {
      return grep {$defaultFiles{$_}} @ARGV;
    }
  } else {
    return 'modern.js';
  }
}


# Tries to figure out a good edit summary by using the last one onwiki to find
# the latest changes; prompts user if it can't find a commit hash
sub buildEditSummary {
  my ($page, $file, $oldCommitish) = @_;
  my $editSummary;
  # Get previous commit if available
  if ($oldCommitish =~ /Repo at (\w*?): /) {
    # Ensure it's a valid commit and no errors are reported back
    my $valid = $repo->command('merge-base' => '--is-ancestor', "$1", 'HEAD');
    my @validE = $valid->stderr()->getlines();
    if (!scalar @validE) {
      my $newLog = $repo->run(log => '--oneline', '--no-merges', '--no-color', "$1..HEAD", "$cwd/$file");
      open my $nl, '<', \$newLog or die colored ['red'], "$ERRNO\n";
      while (<$nl>) {
        chomp;
        my @arr = split / /, $_, 2;
        my $portion = $arr[1] =~ s/^\S+(?::| -) //r;
        $portion =~ s/\.$//;
        $editSummary .= "$portion; ";
      }
      close $nl or die colored ['red'], "$ERRNO\n";
    }
  }

  # Prompt for manual entry
  if (!$editSummary) {
    my @log = $repo->run(log => '-5', '--pretty=format:%s (%h)', '--no-merges', '--no-color', "$cwd/$file");
    print colored ['red'], "Unable to autogenerate edit summary for $page\n\n";
    print "The most recent ON-WIKI edit summary is:\n";
    print colored ['blue'], "\t$oldCommitish\n";
    print "The most recent GIT LOG entries are:\n";
    foreach (@log) {
      print colored ['blue'], "\t$_\n";
    }
    print "Please provide an edit summary (commit ref will be added automatically):\n";
    $editSummary = <STDIN>;
    chomp $editSummary;
  }
  $editSummary =~ s/[\.; ]{1,2}$//; # Tidy

  # 'Repo at' will add 17 characters and MW truncates at 497 to allow for '...'
  my $maxLength = 480;
  while (length $editSummary > $maxLength) {
    my $length = length $editSummary;
    my $over = $length - $maxLength;

    my $message = "The current edit summary is too long by $over character";
    $message .= $over == 1 ? q{} : 's';
    $message .= "and will therefore be truncated.\n";
    print $message;
    print "\t$editSummary\n";
    print "Please provide a shorter summary (under $maxLength characters, the latest commit ref will be added automatically):\n";
    $editSummary = <STDIN>;
    chomp $editSummary;
  }

  my $editBeg = 'Repo at '. $repo->run('rev-parse' => '--short', 'HEAD') . ': ';
  return $editBeg.$editSummary;
}


## The lines below do not represent Perl code, and are not examined by the
## compiler.  Rather, they are the names of files in this directory that I am
## pushing to.
__DATA__
modern.js
  modern.css
  pedit.js
  pinfo.js
  ARAspaceless.js
  AdvisorDashless.js
  CSDHreasons.js
  CatListMainTalkLinks.js
  DiffOnly.js
  ReverseMarked.js
  Search_sort.js
  WRStitle.js
  abusefilter-diff-check.js
  articleinfo-gadget.js
  crathighlighter.js
  csdcheck.js
  deletionFinder.js
  diff-permalink.js
  easyblock-modern.css
  easyblock-modern.js
  endlesscontribs.js
  hideSectionDesktop.js
  historyButtonLinks.js
  logSwap.js
  nulledit.js
  oldafd.js
  osal.js
  pagemods.js
  qrfpp.js
  raw.js
  responseHelper.js
  seventabs.js
  suppressionFinder.js
  test.js
  unhide.js
  userRightsManager.js
  userhist.js
  userinfo.js
  wlhActionLinks.js
