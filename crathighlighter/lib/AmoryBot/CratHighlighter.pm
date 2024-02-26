package AmoryBot::CratHighlighter;

use 5.036;
use Carp;

# Only needed in buildNote
use List::Util qw(uniqstr);

=head1 NAME

AmoryBot::CratHighlighter

=head1 VERSION

Version 0.2.3

=cut

our $VERSION = '0.2.3';

# Actually allow methods to be exported
use Exporter 'import';
our @EXPORT_OK   = qw(processPagesData findStewardMembers findLocalGroupMembers findArbComMembers cmpJSON changeSummary oxfordComma mapGroups buildNote createEmail botShutoffs buildMW);
our %EXPORT_TAGS = (all => \@EXPORT_OK);


# Common error message for subs missing inputs
my $errData = 'Missing data';

=head1 EXPORTS

=over 2

=item * L</processPagesData>

=item * L</findStewardMembers>

=item * L</findLocalGroupMembers>

=item * L</findArbComMembers>

=item * L</cmpJSON>

=item * L</changeSummary>

=item * L</oxfordComma>

=item * L</mapGroups>

=item * L</buildNote>

=item * L</createEmail>

=item * L</botShutoffs>

=item * L</buildMW>

=back

=head1 SUBROUTINES/METHODS

=head2 findStewardMembers

=cut

# Stewards are "simple" thanks to map and simple (one-group) structure
sub findStewardMembers {
  my $stewardData = shift;
  croak $errData if !$stewardData;

  return map {$_->{name} => 1} $stewardData->@*;
}

=head2 findLocalGroupMembers

=cut

# Loop through each user's data and figure out what groups they've got.  Far
# from perfect; ideally I wouldn't use the @localHashes/$localData, but until I
# stop overwriting data on the continue, then it's a necessary hack.
sub findLocalGroupMembers {
  my ($localData, $rightsRef) = @_;
  croak $errData if (!$localData || !$rightsRef);

  my %dataHash;
  # Limit to the groups in question then add that user to the lookup for each
  my %interestedGroups = map {$_ => 1} @{$rightsRef};
  foreach my $userHash (@{$localData}) {
    # The hash lookup is so fast that the savings of doing an array slice here
    # aren't as much as one might think, but we are going through a half-dozen
    # groups for around a thousand users, so it does shake out to be worth it to
    # remove the two leading and uninteresting groups (* and user).  Truth be
    # told, we can do even better by skipping the third group, autoconfirmed, as
    # well, with one caveat: the user "Edit filter" annoyingly exists and has
    # sysop rights, so we need to account for that later since it's not
    # autoconfirmed.  That will hopefully be removed at some point (T212268).
    foreach my $group (@{$userHash->{groups}}[3 .. $#{$userHash->{groups}}]) {
      $dataHash{$group}{$userHash->{name}} = 1 if $interestedGroups{$group};
    }
  }

  # As noted above, manually reinsert the Edit filter user (see
  # <https://phabricator.wikimedia.org/T212268>).  I'm unsure if this should be
  # done here or in the body of the script since it's technically a hack, but
  # for now let's do it here as a drop-in replacement.
  $dataHash{sysop}{'Edit filter'} = 1;

  # Rename suppress to oversight, sigh
  $dataHash{oversight} = delete $dataHash{suppress};

  return %dataHash;
}


=head2 findArbComMembers

=cut

# Process each line of the specific ArbCom page's content to get the users
# listed.  Returns a reference to a hash.
sub findArbComMembers {
  my $templateText = shift;
  croak $errData if !$templateText;

  my %tmpData;
  for (split /^/, $templateText) {
    if (/^:?#\s?\{\{user\|(.*)}}/) {
      $tmpData{$1} = 1;
    } elsif (/(?:\{\{|<)big[\|>]\{\{xtn/) {
      # Avoid listing former Arbs or Arbs-elect, which are occasionally found at
      # the bottom of the list during transitionary periods
      last;
    }
  }
  return \%tmpData;
}


=head2 processPagesData

=cut

# Build hash of array with per group page title, content, and last edited time.
# Requires the query to have been done with formatversion=2
sub processPagesData {
  my $contentRef = shift;
  croak $errData if !$contentRef;

  my %returnData;
  # This monstrosity results in an array where each item is an array of hashes:
  ## title     -> used to also snag the specific group used for hash key
  ## revisions -> array containing one item, which is a hash, which has keys:
  ### timestamp -> time last edited
  ### slots, which is a dumbfuck construct for rvslots, which has:
  #### content   -> full page content
  # With the final result being:
  ## userGroup => [title, content, timestamp]
  # Just awful.  Then again, it could be made even worse!  Worth noting that it
  # should be pretty fast, since it's just reformatting data that's already
  # present, rather than going through each user or anything like that.
  foreach my $pageHash ($contentRef->{query}->{pages}->@*) {
    # Make things just slightly more clear for the final data assignment
    my $userGroup = $pageHash->{title} =~ s/.*\.js\/(.+)\.json/$1/r;
    my @revisions = $pageHash->{revisions}->@*;
    # rvslots is so dumb
    $returnData{$userGroup} = [$pageHash->{title}, $revisions[0]->{slots}{main}{content}, $revisions[0]->{timestamp}];
  }

  return %returnData;
}

=head2 cmpJSON

=cut

# Compare hash from the query with the hash from the file's JSON object, return
# negated equality and arrayrefs of names added/removed to/from the JSON object
sub cmpJSON {
  my ($queryRef, $objectRef) = @_;
  croak $errData if (!$queryRef || !$objectRef);

  croak 'queryRef not a hashref' if ref $queryRef ne ref {};
  croak 'objectRef not a hashref' if ref $objectRef ne ref {};


  # Check array length first, which should be a quick short-circuit for most
  # scenarios, then check if the stringified arrays are equivalent
  if (keys %{$queryRef} == keys %{$objectRef} && join(q{}, sort keys %{$queryRef}) eq join(q{}, sort keys %{$objectRef})) {
    # Nada
    return (q{}, [], []);
  }

  # If not, we've got differences!  Check all the names from the query first,
  # which determines if anyone new needs adding
  my @added;
  foreach (keys %{$queryRef}) {
    # Match in the other file
    if (!${$objectRef}{$_}) {
      push @added, $_;
    } else {
      # Don't check again
      delete ${$objectRef}{$_};
    }
  }

  # 1 is the negated equality, indicating that yes, there are differences
  return (1, [sort @added], [sort keys %{$objectRef}]);
}

=head2 changeSummary

=cut

# Write a summary of added/removed users from the provided array references.
# Uses oxfordComma below for proper grammar.  Used as the basis for the on-wiki
# edit summary and for the emailed note.
sub changeSummary {
  my ($addedRef, $removedRef) = @_;
  # Empty arrays are okay, but missing arrays are not!
  croak $errData if (!$addedRef || !$removedRef);

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
  return join(', ', @list).", and $end";
}

=head2 mapGroups

=cut

# The lookup hash, pulled out since it's used repeatedly
my %lookup = (arbcom            => 'AC',
	      bureaucrat        => 'B',
	      oversight         => 'OS',
	      checkuser         => 'CU',
	      'interface-admin' => 'IA',
	      sysop             => 'SYS',
	      steward           => 'SW'
	     );
# Map a marker of the group in question onto an array or string

# Should rework/rewrite this.  Currently it's only being used to append the list
# it returns to a given array.  Could take the array as a third parameter?
# Ugh. But maybe better.  Or just return an array?  Easy to set as array.
# Anyway, should figure something out. FIXME TODO
sub mapGroups {
  my ($group, $usersRef) = @_;
  croak $errData if !$group;

  my $code = $lookup{$group};
  croak "Group \"$group\" not found in lookup" if !$code;

  # String
  return $code if !$usersRef;
  # Array
  return map {"$_ ($code)"} @{$usersRef};
}


=head2 buildNote

=cut

sub buildNote {
  my ($message, $listRef) = @_;
  croak $errData if !$listRef;

  return q{} if !scalar @{$listRef};

  return "\t$message: ".oxfordComma(uniqstr @{$listRef});
}


=head2 createEmail

=cut

# Report final status.  Each item should already be logged above in the main
# loop, this is just to trigger an update on changes when run on the kubernetes
# schedule.  Probably not needed, but I like having the updates.  Could put it
# behind a flag?
sub createEmail {
  my ($localRef, $wikiRef, $changeRef, $skipPush) = @_;
  croak $errData if (!$localRef || !$wikiRef);

  my $updateNote = 'CratHighlighter updates';
  my $short;
  # Include pages changed if pushing and available.  Maybe I should always have
  # *something* here?  Really clutching at straws though, so prob not worth it
  if (!$skipPush && scalar @{$wikiRef}) {
    $short = join q{ }, map {mapGroups($_)} @{$wikiRef};
    $updateNote .= " ($short)";
  }
  # Maybe remove these if there's nothing else to be added FIXME TODO
  $updateNote .= "\n\n";


  # Local changes
  my $local = @{$localRef};
  if ($local) {
    $short = join q{ }, map {mapGroups($_)} @{$localRef};
    # Remove empty items
    $updateNote .= join "\n", grep { $_ ne q{} } ("Files: $local updated ($short)", buildNote('Added',   $changeRef->{addedFiles}), buildNote('Removed', $changeRef->{removedFiles}));
  }

  # Notify on pushed changes
  my $wiki = @{$wikiRef};
  if ($wiki) {
    $updateNote .= "\n" if $local;
    $updateNote .= "Pages: $wiki ";
    $short = join q{ }, map {mapGroups($_)} @{$wikiRef};
    if (!$skipPush) {
    # Remove empty items
      $updateNote .= join "\n", grep { $_ ne q{} } ("updated ($short)", buildNote('Added',   $changeRef->{addedPages}), buildNote('Removed', $changeRef->{removedPages}));
    } else {
      $updateNote .= "not updated ($short)";
    }
  }

  return $updateNote;

}


=head2 botShutoffs

=cut

# Make sure the bot behaves nicely.  The actual query is in the main script,
# where MediaWiki::API and Log::Log4perl are available; this is just to process
# the data and to produce errors for proper logging.
sub botShutoffs {
  my $json = shift;
  return 'No data' if !$json;

  my $botCheckReturnQuery = $json->{query};

  # Manual shutoff; confirm bot should actually run
  # Arrows means no (de)referencing
  # rvslots is so dumb
  my $checkContent = $botCheckReturnQuery->{pages}[0]->{revisions}[0]->{slots}->{main}->{content};
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


=head2 buildMW

=cut

# Take a MediaWiki::API object, add some things, return it.  Dumb AF way of
# getting around importing MediaWiki::API here, which I don't want to do
# for... reasons?  Whatever.  Minor testing abilities thanks to this.
sub buildMW {
  my ($mw, $opts) = @_;
  croak 'Missing MW object' if !$mw;
  croak 'Wrong class, not \'MediaWiki::API\'' if ref $mw ne 'MediaWiki::API';

  my $cfg = $mw->{config};
  $cfg->{api_url}      = ${$opts}{url}   // 'https://en.wikipedia.org/w/api.php';
  $cfg->{retries}      = ${$opts}{retry} // 1;
  $cfg->{retry_delay}  = ${$opts}{delay} // 300;
  $cfg->{use_http_get} = ${$opts}{get}   // 1;

  # Add error/dieNice
  $cfg->{on_error} = \&{$opts->{error}} if $opts->{error};

  $mw->{ua}->agent("${$opts}{agent} (".$mw->{ua}->agent.')') if ${$opts}{agent};

  return $mw;
}



=head1 AUTHOR

Amory Meltzer, C<< <Amorymeltzer at gmail.com> >>

=head1 LICENSE AND COPYRIGHT

This software is Copyright (c) 2022 by Amory Meltzer.

This is free software, licensed under:

  The WTFPL


=cut

1;
