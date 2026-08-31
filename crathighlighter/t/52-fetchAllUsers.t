#!/usr/bin/env perl

use 5.036;

use AmoryBot::CratHighlighter qw (fetchAllUsers);
use Test::More tests => 7;
use Test::Fatal qw(exception);

# Bad data
like(exception {fetchAllUsers()},             qr/Missing data/, 'No mw');
like(exception {fetchAllUsers('mw')},         qr/Missing data/, 'No return');
like(exception {fetchAllUsers('mw', {})},     qr/Missing data/, 'No query');
like(exception {fetchAllUsers('mw', {}, {})}, qr/Missing data/, 'No listKey');
# Fake continuation but no data
my $noContinueMW = MockMW->new([{continue => {aucontinue => 'PAGE2'},
			       query    => {allusers => [{name => 'Sysop1'}]}},
			      {query    => {}}
			     ]);
like(exception {fetchAllUsers($noContinueMW, $noContinueMW->firstResponse, {}, 'allusers')}, qr/Expected more 'allusers' data while continuing but got none/, 'Continue but no continued items');


# Single page, no continuation at all, so like stewards or whatever
my $single  = MockMW->new([{query => {allusers => [{name => 'Sysop1'}]}}]);
my @results = fetchAllUsers($single, $single->firstResponse, {}, 'allusers');
is_deeply(makeMap(@results), ['Sysop1'], 'single page, no continuation');


# More than one page, the normal case.  I don't need the groups here for just
# this testing, do I?  That's in findLocalGroupMembers FIXME TODO
my $twoPage = MockMW->new([{continue => {aucontinue => 'PAGE2'},
			     query    => {allusers => [{name => 'Sysop1'}]}},
			    {query    => {allusers => [{name => 'Sysop2'}]}}
			   ]);
@results = fetchAllUsers($twoPage, $twoPage->firstResponse, {}, 'allusers');
is_deeply(makeMap(@results), ['Sysop1', 'Sysop2'], 'Two pages, merged, in order');


sub makeMap {
  return [map {$_->{name}} @_];
}

# Fake-ass mock of MediaWiki::API's api method.  Returns each response in turn
# as if we were continuing.  firstResponse issues (and returns) the first
# response (go figure), which exists *before* we run fetchAllUsers
package MockMW;

sub new {
  my ($class, $responses) = @_;
  return bless {responses => $responses, index => 0}, $class;
}

sub firstResponse {
  my $self = shift;
  return $self->api();
}

sub api {
  my $self = shift;
  return $self->{responses}[$self->{index}++];
}
