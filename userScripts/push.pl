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

# Open API and log in before anything else
my $mw = MediaWiki::API->new({
			      api_url => "https://en.wikipedia.org/w/api.php"
			     });
$mw->{ua}->agent('Amorymeltzer/push.pl ('.$mw->{ua}->agent.')');
$mw->login({lgname => $conf{username}, lgpassword => $conf{password}});

# Push
my $me = 'User:Amorymeltzer/';
while (<DATA>) {
  s/\s+//g;
  print "\tPushing $_...\n";
  my $file = $me.$_;
  # Get old page content
  my $wikiPage = $mw->get_page({title => $file});
  if (defined $wikiPage->{missing}) {
    print colored ['red'], "$file does not exist\n";
    exit 1;
  } else {
    my $timestamp = $wikiPage->{timestamp};
    my $text = read_text($_);
    my $wikiText = $wikiPage->{q{*}};
    if ($text eq $wikiText) {
      print colored ['green'], " No changes needed, skipping\n";
    } else {
      $mw->edit({
		 action => 'edit',
		 title => $file,
		 basetimestamp => $timestamp, # Avoid edit conflicts
		 text => $text,
		 summary => 'Updating to the latest version'
		}) || die "Error editing the page: $mw->{error}->{code}: $mw->{error}->{details}\n";
      my $return = $mw->{response};

      if ($return->{_msg} eq 'OK') {
	print colored ['green'], "\t$_ successfully pushed to $file\n";
      } else {
	print colored ['red'], "Error pushing $_: $mw->{error}->{code}: $mw->{error}->{details}\n";
      }
    }
  }
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
