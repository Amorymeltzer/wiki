package AmoryBot::CratHighlighter;

# Just for POD, toolforge has 5.028
use 5.006;
use strict;
use warnings;

use List::Util qw(uniqstr);

=head1 NAME

AmoryBot::CratHighlighter

=head1 VERSION

Version 0.01

=cut

our $VERSION = '0.01';

# Actually allow methods to be exported
use Exporter 'import';
our @EXPORT_OK = qw(processFileData findStewardMembers findLocalGroupMembers findArbComMembers cmpJSON changeSummary oxfordComma mapGroups buildNote);
our %EXPORT_TAGS = ( all => \@EXPORT_OK);

=head1 SYNOPSIS

Quick summary of what the module does.

Perhaps a little code snippet.

    use AmoryBot::CratHighlighter;

    my $foo = AmoryBot::CratHighlighter->new();
    ...

=head1 EXPORT

A list of functions that can be exported.  You can delete this section
if you don't export anything, such as for a purely object-oriented module.

=head1 SUBROUTINES/METHODS

=head2 findStewardMembers

Stewards are "simple" thanks to map and simple (one-group) structure.  As with
the git utilities in AmoryBot::CratHighlighter::GitUtils, this mis/abuses @_ for
brevity, rather than merely `shift`-ing

=cut

sub findStewardMembers {
  return map {$_->{name} => 1} @{$_[0]};
}

=head2 findLocalGroupMembers

=cut

# Loop through each user's data and figure out what groups they've got.  Far
# from perfect; ideally I wouldn't use the @localHashes/$localData, but until
# I stop overwriting data on the continue, then it's a necessary hack
# Should rewrite to return FIXME TODO
sub findLocalGroupMembers {
  my ($localData, $rightsRef, $dataHashRef) = @_;

  # Limit to the groups in question then add that user to the lookup for each
  my %interestedGroups = map {$_=>1} @{$rightsRef};
  foreach my $userHash (@{$localData}) {

    # Interestingly, doing a splice or something to remove the two leading and
    # uninteresting groups (* and user) doesn't speed this up since the hash
    # lookup is so fast, even with nearly 5000 calls.
    foreach my $group (@{${$userHash}{groups}}) {
      ${$dataHashRef}{$group}{${$userHash}{name}} = 1 if $interestedGroups{$group};
    }
  }

  # Rename suppress to oversight, sigh
  ${$dataHashRef}{oversight} = delete ${$dataHashRef}{suppress};
}


=head2 findArbComMembers

=cut

# Process each line of the specific ArbCom page's content to get the users
# listed.  Returns a reference to a hash.
sub findArbComMembers {
  my %tmpData;
  for (split /^/, shift) {
    if (/^:#\{\{user\|(.*)}}/) {
      $tmpData{$1} = 1;
    } elsif (/^:;<big>\{\{xtn\|/) {
      # Avoid listing former Arbs or Arbs-elect, which are occasionally found at
      # the bottom of the list during transitionary periods
      last;
    }
  }
  return \%tmpData;
}


=head2 processFileData

=cut

# Build hash of array with per group page title, content, and last edited time.
# Requires the query used formatversion=2
sub processFileData {
  my $contentRef = shift;
  my %returnData;
  # This monstrosity results in an array where each item is an array of hashes:
  ## title     -> used to also snag the specific group used for hash key
  ## revisions -> array containing one item, which is a hash, which has keys:
  ### content   -> full page content
  ### timestamp -> time last edited
  # Just awful.  Then again, it could be made even worse!
  foreach my $pageHash (@{${${$contentRef}{query}}{pages}}) {
    my $userGroup = ${$pageHash}{title} =~ s/.*\.js\/(.+)\.json/$1/r;
    my @revisions = @{${$pageHash}{revisions}};
    $returnData{$userGroup} = [${$pageHash}{title},${$revisions[0]}{content},${$revisions[0]}{timestamp}];
  }

  return %returnData;
}

=head2 cmpJSON

=cut

# Compare query hash with a JSON object hash, return negated equality and
# arrays of added added and removed names from the JSON object
sub cmpJSON {
  my ($queryRef, $objectRef) = @_;

  return if ref $queryRef ne ref {};
  return if ref $objectRef ne ref {};

  # Feels inefficient/brute force-y, but it's quick enough
  my @qNames = sort keys %{$queryRef};
  my @oNames = sort keys %{$objectRef};

  my (@added, @removed);

  # Only if stringified arrays aren't equivalent
  my $state = "@qNames" ne "@oNames";
  if ($state) {
    # Check all names from the query first, will determine if anyone new
    # needs adding
    foreach (@qNames) {
      # Match in the other file
      if (!${$objectRef}{$_}) {
	push @added, $_;
      } else {
	# Don't check again
	delete ${$objectRef}{$_};
      }
    }

    # Whatever is left should be anyone that needs removing; @oNames is
    # unreliable after above
    @removed = sort keys %{$objectRef};
  }

  return ($state, \@added, \@removed);
}

=head2 changeSummary

=cut

# Write a summary of added/removed users from the provided array references.
# Uses oxfordComma below for proper grammar.  Used as the basis for the on-wiki
# edit summary and for the emailed note.
sub changeSummary {
  my ($addedRef,$removedRef) = @_;
  my $change = q{};

  if (scalar @{$addedRef}) {
    $change .= 'Added '.oxfordComma(@{$addedRef});
  }
  if (scalar @{$removedRef}) {
    $change .= '; ' if length $change;
    $change .= 'Removed '.oxfordComma(@{$removedRef});
  }

  return $change;
}

=head2 oxfordComma

=cut

# Oxford comma
sub oxfordComma {
  my @list = @_;
  if (scalar @list < 3) {
    return join ' and ', @list;
  }
  my $end = pop @list;
  return join(', ', @list) . ", and $end";
}

=head2 mapGroups

=cut

# Map a marker of the group in question onto an array

# Should rework/rewrite this.  Currently it's only being used to append the list
# it returns to a given array.  Could take the array as a third parameter?
# Ugh. But maybe better.  Or just return an array?  Easy to set as array.
# Anyway, should figure something out. FIXME TODO
sub mapGroups {
  my ($group, $usersRef) = @_;

  my %lookup = (
		arbcom            => 'AC',
		bureaucrat        => 'B',
		oversight         => 'OS',
		checkuser         => 'CU',
		'interface-admin' => 'IA',
		sysop             => 'SYS',
		steward           => 'SW'
	       );
  return map { $_." ($lookup{$group})" } @{$usersRef};
}


=head2 buildNote

=cut

sub buildNote {
  my ($message, $listRef) = @_;
  return q{} if ! scalar @{$listRef};

  return "\t$message: ".oxfordComma(uniqstr @{$listRef})."\n";
}

=head1 AUTHOR

Amory Meltzer, C<< <Amorymeltzer at gmail.com> >>

=head1 LICENSE AND COPYRIGHT

This software is Copyright (c) 2022 by Amory Meltzer.

This is free software, licensed under:

  The WTFPL


=cut

1; # End of AmoryBot::CratHighlighter
