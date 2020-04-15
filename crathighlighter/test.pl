#!/usr/bin/env perl
# test.pl by Amory Meltzer
# 

use strict;
use warnings;
use diagnostics;

use Getopt::Std;
use Config::General qw(ParseConfig);
use MediaWiki::API;
use Git::Repository;
use File::Slurper qw(read_text write_text);
use File::Compare;
use JSON;
use Term::ANSIColor;

use Data::Dumper;


# Parse commandline options
my %opts = ();
getopts('hpc', \%opts);
if ($opts{h}) { usage(); exit; } # Usage

# Check repo before doing anything risky
my $repo = Git::Repository->new();

# Config file should be a simple file consisting of username and botpassword
# username = Jimbo Wales
# password = stochasticstring
my %conf;
my $config_file = "$ENV{HOME}/.crathighlighterrc";
%conf = ParseConfig($config_file) if -e -f -r $config_file;

my $mw = MediaWiki::API->new({
			      api_url => 'https://en.wikipedia.org/w/api.php',
			      on_error => \&dieNice
			     });
$mw->{ua}->agent('dev-cratHighlighterSubpages.pl ('.$mw->{ua}->agent.')');
$mw->login({lgname => $conf{username}, lgpassword => $conf{password}});

# Template for generating JSON, sorted
my $jsonTemplate = JSON::PP->new->canonical(1);
$jsonTemplate = $jsonTemplate->indent(1)->space_after(1); # Make prettyish



# my @rights = qw (bureaucrat oversight checkuser interface-admin arbcom steward);
my @rights = qw (bureaucrat oversight);
print "$rights[0]\n";
# my $pTitle = "User:Amorymeltzer/crathighlighter.js/$rights[0].json";
# my $getPage = $mw->get_page({title => $pTitle});
# my $wikiJSON = $getPage->{q{*}};

# print Dumper($getPage);
# print "$wikiJSON\n";

# All of em
my @titles = map { 'User:Amorymeltzer/crathighlighter.js/'.$_.'.json' } @rights;
my $alltitles = join q{|}, @titles;
print "$alltitles\n";
my $query = {
	     action => 'query',
	     prop => 'revisions',
	     rvprop => 'content',
	     titles => $alltitles,
	     format => 'json',
	     formatversion => 2,
	     indexpageids => 1,
	     utf8 => '1'
	    };

# Reference to hash?
my $ret = $mw->api($query);
# print Dumper($ret);
print keys %{$ret};
print "\n";
# Oy
print keys %{${$ret}{query}};
print "\n";
# Oy Oy
my @pageids =  @{${${$ret}{query}}{pageids}};

# Okay, so can just do the above monstrosity for pages
my @pages = @{${${$ret}{query}}{pages}};
# Then each item in the array is a hash, the keys of which are:
# title -> set use to set the content, maybe use as key in data hash
# revisions -> array containing one item, which is a hash, which has keys:
# content -> content
my %first = %{$pages[0]};
my @firstRevisions = @{$first{revisions}};
# print Dumper(@firstRevisions);
my %revs = %{$firstRevisions[0]};
print $revs{content};
# print Dumper(%revs);

# my $hashref = $jsonTemplate->encode($ret);
# my @decoded = $jsonTemplate->decode($hashref);
# print Dumper(\@decoded);
# print Dumper($decoded[0]);
