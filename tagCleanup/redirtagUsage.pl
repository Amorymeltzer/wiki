#!/usr/bin/env perl
# tagUsage.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Get transclusion counts for redirect tags, compare to Twinkle

use strict;
use warnings;
use diagnostics;

use URI::Escape;

# Get all templates from [[Template:R template index]]
my $tagUrl = 'https://en.wikipedia.org/w/index.php?title=Template:R_template_index&action=raw';
my $tagRaw = `curl -s "$tagUrl"`;
my @tagList;
my $inlineSect = 0;
foreach (split /\n/, $tagRaw) {
  if (/^\*+\s\{\{tl\|(R .+?)\}\}/) {
    push @tagList, ucfirst $1;
  }
}

# Get current redirect tags in Twinkle
my $twUrl = 'https://raw.githubusercontent.com/azatoth/twinkle/master/modules/friendlytag.js';
my $twRaw = `curl -s "$twUrl"`;
my %twList;
my $tagsYet = 0;
foreach (split /\n/, $twRaw) {
  if (/label: '\{\{(R .+?)\}\}:/) {
    $twList{ucfirst $1} = 1;
  }
}

# Get current transclusion count
my %data;
foreach (sort @tagList) {
  my $template = $_;
  my $templateEsc = uri_escape ($template);
  my $url = "https://tools.wmflabs.org/linkscount/?namespace=10&p=$templateEsc&dbname=enwiki";
  my $json = `curl -s "$url"`;
  my $count = $json =~ s/.*"templatelinks":(\d+),.*/$1/r;
  my $true = $twList{$template} ? 'yes' : 'no';
  $data{$template} = [$count, $true];
}

# CSV
open my $out, '>', 'usageStatsRedirects.csv' or die $1;
print $out "Template,Count,Twinkle\n";
# Sort on twinkle status then transclusion count
foreach my $temp (sort {$data{$a}[1] cmp $data{$b}[1] || $data{$b}[0] <=> $data{$a}[0]} keys %data) {
  print $out "$temp,$data{$temp}[0],$data{$temp}[1]\n";
}
close $out or die $1;
