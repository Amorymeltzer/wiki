package AmoryBot::CratHighlighter;

# Just for POD, toolforge has 5.028
use 5.006;
use strict;
use warnings;

# Only needed in buildNote
use List::Util qw(uniqstr);

=head1 NAME

AmoryBot::CratHighlighter

=head1 VERSION

Version 0.1

=cut

our $VERSION = '0.1';

# Actually allow methods to be exported
use Exporter 'import';
our @EXPORT_OK = qw(processFileData findStewardMembers findLocalGroupMembers findArbComMembers cmpJSON changeSummary oxfordComma mapGroups buildNote createEmail botShutoffs);
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
brevity, rather than merely `shift`-ing.  No real error handling.

=cut

sub findStewardMembers {
  return map {$_->{name} => 1} @{$_[0]};
}

=head2 findLocalGroupMembers

=cut

# Loop through each user's data and figure out what groups they've got.  Far
# from perfect; ideally I wouldn't use the @localHashes/$localData, but until I
# stop overwriting data on the continue, then it's a necessary hack.
sub findLocalGroupMembers {
  my ($localData, $rightsRef) = @_;
  return if (!$localData || !$rightsRef);

  my %dataHash;
  # Limit to the groups in question then add that user to the lookup for each
  my %interestedGroups = map {$_=>1} @{$rightsRef};
  foreach my $userHash (@{$localData}) {
    # The hash lookup is so fast that the savings of doing an array slice here
    # aren't as much as one might think, but we are going through a half-dozen
    # groups for around a thousand users, so it does shake out to be worth it to
    # remove the two leading and uninteresting groups (* and user)
    foreach my $group (@{${$userHash}{groups}}[2..$#{${$userHash}{groups}}]) {
      $dataHash{$group}{${$userHash}{name}} = 1 if $interestedGroups{$group};
    }
  }

  # Rename suppress to oversight, sigh
  $dataHash{oversight} = delete $dataHash{suppress};

  return %dataHash;
}


=head2 findArbComMembers

=cut

# Process each line of the specific ArbCom page's content to get the users
# listed.  Returns a reference to a hash.
sub findArbComMembers {
  my $templateText = shift || return;

  my %tmpData;
  for (split /^/, $templateText) {
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
  my $contentRef = shift or return;
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
  my ($addedRef, $removedRef) = @_;

  # Empty arrays are okay, but missing arrays are not!
  return if (!$addedRef || !$removedRef);

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

  return if !$group;

  my %lookup = (
		arbcom            => 'AC',
		bureaucrat        => 'B',
		oversight         => 'OS',
		checkuser         => 'CU',
		'interface-admin' => 'IA',
		sysop             => 'SYS',
		steward           => 'SW'
	       );
  # Reassign bad but w/e
  $group = $lookup{$group};

  return if ! $group;

  # String
  return $group if !$usersRef;
  # Array
  return map { "$_ ($group)" } @{$usersRef};
}


=head2 buildNote

=cut

sub buildNote {
  my ($message, $listRef) = @_;
  return if !$listRef;

  return q{} if ! scalar @{$listRef};

  return "\t$message: ".oxfordComma(uniqstr @{$listRef})."\n";
}


=head2 createEmail

=cut

# Report final status via email.  Each item should already be logged above in the
# main loop, this is just to trigger an email on changes when run via cron.
# Probably not needed except to update the newsletter, but I like having the
# updates.  Could put it behind a flag?
sub createEmail {
  my ($localRef, $wikiRef, $changeRef, $skipPush) = @_;
  return if (!$localRef || !$wikiRef);

  my $updateNote = 'CratHighlighter updates';
  my $short;
  # Include pages changed if pushing and available.  Maybe I should always have
  # *something* here?  Really clutching at straws though, so prob not worth it
  if (!$skipPush && scalar @{$wikiRef}) {
    $short = join q{ }, map { mapGroups($_) } @{$wikiRef};
    $updateNote .= " ($short)";
  }
  # Maybe remove these if there's nothing else to be added FIXME TODO
  $updateNote .= "\n\n";


  # Local changes
  my $local = @{$localRef};
  if ($local) {
    $short = join q{ }, map { mapGroups($_) } @{$localRef};
    $updateNote .= "Files: $local updated ($short)\n";
    $updateNote .= buildNote('Added', @{$changeRef}[0]);
    $updateNote .= buildNote('Removed', @{$changeRef}[1]);
  }

  # Notify on pushed changes
  my $wiki = @{$wikiRef};
  if ($wiki) {
    $updateNote .= "Pages: $wiki ";
    $short = join q{ }, map { mapGroups($_) } @{$wikiRef};
    if (!$skipPush) {
      $updateNote .= "updated ($short)\n";
      $updateNote .= buildNote('Added', @{$changeRef}[2]);
      $updateNote .= buildNote('Removed', @{$changeRef}[3]);
    } else {
      $updateNote .= "not updated ($short)\n";
    }
  }

  return $updateNote;

}


=head2 botShutoffs

=cut

# Make sure the bot behaves nicely.  The actual query is in the main script,
# where MediaWiki::API and Log::Log4perl are available; this is just to process
# the data and to produce errors for proper logging.  Notably, that means this
# is the only subroutine one where the bare return is the good state.
sub botShutoffs {
  my $json = shift;
  return 'No data' if ! $json;

  my $botCheckReturnQuery = $json->{query};

  # Manual shutoff; confirm bot should actually run
  # Arrows means no (de)referencing
  my $checkContent = $botCheckReturnQuery->{pages}[0]->{revisions}[0]->{content};
  if (!$checkContent || $checkContent ne '42') {
    return 'DISABLED on-wiki';
  }

  # Automatic shutoff: user has talkpage messages.  Unlikely as it redirects to
  # my main talk page, which I *don't* want to be an autoshutoff.
  my $userNotes = $botCheckReturnQuery->{userinfo}->{messages};
  if ($userNotes) {
    return 'User has talkpage message(s)';
  }
  return;
}



=head1 AUTHOR

Amory Meltzer, C<< <Amorymeltzer at gmail.com> >>

=head1 LICENSE AND COPYRIGHT

This software is Copyright (c) 2022 by Amory Meltzer.

This is free software, licensed under:

  The WTFPL


=cut

1; # End of AmoryBot::CratHighlighter
