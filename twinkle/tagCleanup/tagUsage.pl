#!/usr/bin/env perl
# tagUsage.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Get transclusion counts for cleanup tags, compare to Twinkle

use strict;
use warnings;
use diagnostics;

use URI::Escape;

# Get all templates from [[Wikipedia:Template messages/Cleanup]]
my $tagUrl = 'https://en.wikipedia.org/w/index.php?title=Wikipedia:Template_messages/Cleanup&action=raw';
my $tagRaw = `curl -s "$tagUrl"`;
my @tagList;
my $inlineSect = 0;
foreach (split /\n/, $tagRaw) {
  if ($inlineSect == 0) {
    if (/^=+.*inline.*=+/i) {
      $inlineSect = 1;
      next;
    } else {
      next if /^\{\{.*?[ _-\|](?:section|inline).*?\}\}.*/i;
      push @tagList, ucfirst $1 if /^\{\{tlrow\|(.*?)(?:\|.+)*\}\}.*/;
    }
  } else {
    $inlineSect = 0 if (/^==+/ && !/inline/i);
    next;
  }
}

# Get current article tags in Twinkle
my $twUrl = 'https://raw.githubusercontent.com/azatoth/twinkle/master/modules/friendlytag.js';
my $twRaw = `curl -s "$twUrl"`;
my %twList;
my $tagsYet = 0;
foreach (split /\n/, $twRaw) {
  if ($tagsYet == 1) {
    last if /};/;
    my $tmp = $_ =~ s/.*"(.*)":.*/$1/r;
    $twList{ucfirst $tmp} = 1;
  } else {
    $tagsYet = 1 if /^Twinkle\.tag\.article\.tags = \{/;
    next;
  }
}

# Get current mainspace transclusion count
my %data;
foreach (sort @tagList) {
  my $template = $_;
  my $templateEsc = uri_escape ($template);
  my $url = "https://tools.wmflabs.org/linkscount/?namespace=10&p=$templateEsc&fromNamespace=0&dbname=enwiki";
  my $json = `curl -s "$url"`;
  my $count = $json =~ s/.*"templatelinks":(\d+),.*/$1/r;
  my $true = $twList{$template} ? 'yes' : 'no';
  $data{$template} = [$count, $true];
  print "$template\t@{$data{$template}}\n";
}

# CSV
open my $out, '>', 'usageStats.csv' or die $1;
print $out "Template,Count,Twinkle\n";
# Sort on twinkle status then transclusion count
foreach my $temp (sort {$data{$b}[1] cmp $data{$a}[1] || $data{$b}[0] <=> $data{$a}[0]} keys %data) {
  print $out "$temp,$data{$temp}[0],$data{$temp}[1]\n";
}
close $out or die $1;
