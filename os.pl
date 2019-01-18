#!/usr/bin/env perl
# os.pl by Amory Meltzer
# Process quarry querys

use strict;
use warnings;
use diagnostics;

if (@ARGV != 1) {
  print "Input table required\n";
  exit;
}

my $input = $ARGV[0];
my $output = $input.'.out';
open my $in, '<', "$input" or die $1;
open my $out, '>', "$output" or die $1;
while (<$in>) {
  chomp;
  s/^\|(\d+)\|\|(.*?)\|\|(0)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/$4|$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(1)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Talk:$4|Talk:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(2)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/User:$4|User:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(3)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/User talk:$4|User talk:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(4)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Wikipedia:$4|Wikipedia:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(5)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Wikipedia talk:$4|Wikipedia talk:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(6)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/File:$4|File:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(7)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/File talk:$4|File talk:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(8)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/MediaWiki:$4|MediaWiki:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(9)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/MediaWiki talk:$4|MediaWiki talk:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(10)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Template:$4|Template:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(11)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Template talk:$4|Template talk:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(12)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Help:$4|Help:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(13)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Help talk:$4|Help talk:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(14)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Category:$4|Category:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(15)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Category talk:$4|Category talk:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(100)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Portal:$4|Portal:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(101)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Portal talk:$4|Portal talk:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(108)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Book:$4|Book:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(109)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Book talk:$4|Book talk:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(118)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Draft:$4|Draft:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(119)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Draft talk:$4|Draft talk:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(828)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Module:$4|Module:$4]]||/ix;
  s/^\|(\d+)\|\|(.*?)\|\|(829)\|\|(.*?)\|\|/|$1||$2||$3||[[Special:Undelete\/Module talk:$4|Module talk:$4]]||/ix;

  print $out "$_\n";
}
close $in or die $1;
close $out or die $1;
