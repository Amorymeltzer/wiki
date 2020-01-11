#!/usr/bin/env perl
# push.pl by Amory Meltzer
# Push new version live to my userspace
# Heavily borrowed from cratHighlighterSubpages.pl, as well as my rewrite of Twinkle's sync.pl:
# https://github.com/azatoth/twinkle/blob/616aeb6e1933162c25a95bbcbf82df0a613f9707/sync.pl

use strict;
use warnings;
use diagnostics;

use English qw(-no_match_vars);
use utf8;

use Config::General qw(ParseConfig);
use MediaWiki::API;
use Git::Repository;
use File::Slurper qw(read_text);
use Term::ANSIColor;

# Simpler to just use my twinklerc and check it's the right me
my %conf;
my $config_file = "$ENV{HOME}/.twinklerc";
%conf = ParseConfig($config_file) if -e -f -r $config_file;

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
# Make sure it's me
if ($conf{username} !~ '^Amorymeltzer') {
  print colored ['red'], "Not Amorymeltzer, quitting\n";
  exit 1;
}

# Open git handler
my $repo = Git::Repository->new();

# Open API and log in before anything else
my $mw = MediaWiki::API->new({
			      api_url => "https://en.wikipedia.org/w/api.php"
			     });
$mw->{ua}->agent('Amorymeltzer/push.pl ('.$mw->{ua}->agent.')');
$mw->login({lgname => $conf{username}, lgpassword => $conf{password}});

# Make sure only valid files are entered
my %defaultFiles;
my @files;
while (<DATA>) {
  s/\s+//g;
  $defaultFiles{$_} = 1;
}
if (@ARGV != 0) {
  if ($ARGV[0] eq 'all' || $ARGV[0] eq 'All') {
    @files = keys %defaultFiles;
  } else {
    foreach (@ARGV) {
      push @files, $_ if $defaultFiles{$_};
    }
  }
} else {
  print "No files provided!\n";
  exit 1;
}
# Push
my $me = 'User:Amorymeltzer/';
foreach (@files) {
  s/\s+//g;
  my $file = $me.$_;
  # Get old page content
  my $wikiPage = $mw->get_page({title => $file});
  if (defined $wikiPage->{missing}) {
    print colored ['red'], "$file does not exist\n";
    exit 1;
  } else {
    print "Pushing $_...\n";
    my $text = read_text($_);
    my $wikiText = $wikiPage->{q{*}};
    if ($text eq $wikiText) {
      print colored ['green'], "\tNo changes needed, skipping\n";
    } else {
      my $timestamp = $wikiPage->{timestamp};
      my $summary = buildEditSummary($file, $_, $wikiPage->{comment});
      $mw->edit({
		 action => 'edit',
		 title => $file,
		 basetimestamp => $timestamp, # Avoid edit conflicts
		 text => $text,
		 summary => $summary
		}) || die "\tError editing the page: $mw->{error}->{code}: $mw->{error}->{details}\n";
      my $return = $mw->{response};

      if ($return->{_msg} eq 'OK') {
	print colored ['green'], "\t$_ successfully pushed to $file\n";
      } else {
	print colored ['red'], "\tError pushing $_: $mw->{error}->{code}: $mw->{error}->{details}\n";
      }
    }
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
    my $validC = $valid->stderr();
    if (eof $validC) {
      my $newLog = $repo->run(log => '--oneline', '--no-merges', '--no-color', "$1..HEAD", $file);
      open my $nl, '<', \$newLog or die colored ['red'], "$ERRNO\n";
      while (<$nl>) {
	chomp;
	my @arr = split / /, $_, 2;
	if ($arr[1] =~ /(\S+(?:\.(?:js|css))?) ?[:|-] ?(.+)/) {
	  my $fixPer = $2;
	  $fixPer =~ s/\.$//; # Just in case
	  $editSummary .= "$fixPer; ";
	}
      }
      close $nl or die colored ['red'], "$ERRNO\n";
    }
  }

  # Prompt for manual entry
  if (!$editSummary) {
    my @log = $repo->run(log => '-5', '--pretty=format:%s (%h)', '--no-merges', '--no-color', $file);
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
  ARAspaceless.js
  nulledit.js
  AdvisorDashless.js
  oldafd.js
  CSDHreasons.js
  osal.js
  CatListMainTalkLinks.js
  pagemods.js
  DiffOnly.js
  pedit.js
  ReverseMarked.js
  pinfo.js
  Search_sort.js
  WRStitle.js
  qrfpp.js
  ajaxsendcomment.js
  raw.js
  articleinfo-gadget.js
  responseHelper.js
  crathighlighter.js
  seventabs.js
  csdcheck.js
  suppressionFinder.js
  dashes.js
  deletionFinder.js
  test.js
  diff-permalink.js
  easyblock-modern.js
  easyblock-modern.css
  unhide.js
  googleTitle.js
  userRightsManager.js
  hideSectionDesktop.js
  userinfo.js
  huggle.yaml.js
  wlhActionLinks.js
  logSwap.js
  wordcount.js