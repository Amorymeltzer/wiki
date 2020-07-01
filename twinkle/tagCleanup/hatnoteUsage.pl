#!/usr/bin/env perl
# hatnoteUsage.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Get transclusion counts for hatnote templates

use strict;
use warnings;
use diagnostics;

use URI::Escape;

# Start with some basics from Twinkle, not in the template
my @hatList = ('Correct title', 'Dablink', 'Other', 'Other persons', 'The');

# Get all templates from [[Template:Hatnote templates]]
my $hatUrl = 'https://en.wikipedia.org/w/index.php?title=Template:Hatnote_templates&action=raw';
my $hatRaw = `curl -s "$hatUrl"`;
foreach (split /\n/, $hatRaw) {
  if (/\{\{tl\|(.+?)\}\}/) {
    push @hatList, ucfirst $1;
  }
}

# Get current transclusion count
# Could do jsut mainspace, as that's where MOS:ORDER matters most, but there's
# no real reason not to respect it elsewhere for accessibility reasons
my %data;
foreach (sort @hatList) {
  my $template = $_;
  my $templateEsc = uri_escape ($template);
  my $url = "https://tools.wmflabs.org/linkscount/?namespace=10&p=$templateEsc&dbname=enwiki";
  # my $url = "https://tools.wmflabs.org/linkscount/?namespace=10&p=$templateEsc&fromNamespace=0&dbname=enwiki";
  my $json = `curl -s "$url"`;
  my $count = $json =~ s/.*"templatelinks":(\d+),.*/$1/r;
  $data{$template} = $count;
}

# CSV
open my $out, '>', 'hatnoteStats.csv' or die $1;
print $out "Template,Count,Twinkle\n";
# Sort on twinkle status then transclusion count
foreach my $temp (sort {$data{$b} <=> $data{$a}} keys %data) {
  print $out "$temp,$data{$temp}\n";
}
close $out or die $1;
