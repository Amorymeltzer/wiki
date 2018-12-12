#!/usr/bin/env perl
# twinkleCheck.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Check which Twinkle modules need updating
## Should probably check that I'm on master first, and that things are clean

use strict;
use warnings;
use diagnostics;

my $twDir = $ENV{HOME};		# MAGIC hash with user env variables for $home
$twDir .= '/Documents/git/twinkle@azatoth/';
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
  my $hash = `md5 -q $twDir$twName`;

  s/modules\///;		# Tidy for MW name
  my $url = 'https://en.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-';
  $url .= $_;
  my $json = `curl -s -w '\n' "$url"`; # Add newline for diffing/md5ing

  open my $out, '>', "$_" or die $1;
  print $out $json;
  close $out or die $1;

  my $newHash = `md5 -q $_`;
  if ($hash ne $newHash) {
    print "$_ changed\n";
  }
  unlink;
}
