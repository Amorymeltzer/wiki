#!/usr/bin/env perl
# twinkleCheck.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Check which Twinkle modules need updating

use strict;
use warnings;
use diagnostics;

# MAGIC hash with user env variables for $home
chdir "$ENV{HOME}/Documents/git/twinkle\@azatoth/" or die "$!";

# Ensure Twinkle repo is clean
my $gs = `git status`;
# if ($gs !~ /On branch master/ || $gs !~ /nothing to commit, working tree clean/) {
if ($gs !~ /nothing to commit, working tree clean/) {
  # print "Directory not clean or on master\n";
  print "Directory not clean\n";
  exit;
}

my @files = qw (Twinkle.js Twinkle.css Twinkle-pagestyles.css morebits.js
		morebits.css modules/friendlyshared.js modules/friendlytag.js
		modules/friendlytalkback.js modules/friendlywelcome.js
		modules/twinklearv.js modules/twinklebatchdelete.js
		modules/twinklebatchprotect.js modules/twinklebatchundelete.js
		modules/twinkleblock.js modules/twinkleconfig.js
		modules/twinkledeprod.js modules/twinklediff.js
		modules/twinklefluff.js modules/twinkleimage.js
		modules/twinkleprod.js modules/twinkleprotect.js
		modules/twinklespeedy.js modules/twinkleunlink.js
		modules/twinklewarn.js modules/twinklexfd.js);

foreach (@files) {
  my $twName = lc;		# twinke.js/css/-pagestyles.css are capped
  # my $hash = `md5 -q $twDir$twName`;
  my $hash = `md5 -q $twName`;

  s/modules\///;		# Tidy for MW name

  my $url;
  if (@ARGV && $ARGV[0] eq 'test') {
    $url = 'https://test.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-';
  } else {
    $url = 'https://en.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-';
  }

  $url .= $_;
  my $json = `curl -s -w '\n' "$url"`; # Add newline for diffing/md5ing

  my $tmp = $_.'tmp';
  open my $out, '>', "$tmp" or die $1;
  print $out $json;
  close $out or die $1;

  my $newHash = `md5 -q $tmp`;
  if ($hash ne $newHash) {
    print "$_ changed\n";
  }
  unlink $tmp;
}
