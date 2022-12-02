package AmoryBot::CratHighlighter;

use 5.006;			# FIXME TODO
use strict;
use warnings;

use Git::Repository;

=head1 NAME

AmoryBot::CratHighlighter

=head1 VERSION

Version 0.01

=cut

our $VERSION = '0.01';

# Actually allow methods to be exported
use Exporter 'import';
# our @EXPORT_OK = qw(mwLogin getConfig dieNice botShutoffs getCurrentGroups findLocalGroupMembers findArbComMembers getPageGroups processFileData cmpJSON changeSummary oxfordComma mapGroups gitOnMain gitCleanStatus gitSHA;
our @EXPORT_OK = qw(processFileData findLocalGroupMembers findArbComMembers changeSummary oxfordComma mapGroups gitOnMain gitCleanStatus gitSHA);
our %EXPORT_TAGS = ( all => \@EXPORT_OK);
our @EXPORT = \@EXPORT_OK;

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

=head2 TODO

=cut

# # Handle logging in to the wiki, mainly ensuring we die nicely
# sub mwLogin {
#   # Hashref holding configuration options
#   my $config = getConfig(shift);

#   my $username = ${$config}{username};
#   my $password = ${$config}{password};

#   # Used globally to make edit summaries, page titles, etc. easier
#   $bot = 'User:'.$username =~ s/@.*//r;

#   # Global, declared above
#   $mw = MediaWiki::API->new({
# 			     api_url => "${$config}{url}/w/api.php",
# 			     retries => '1',
# 			     retry_delay => '300', # Try again after 5 mins
# 			     on_error => \&dieNice,
# 			     use_http_get => '1' # use GET where appropriate
# 			    });
#   # FIXME TODO Rename to just cratHighlighter
#   $mw->{ua}->agent('cratHighlighterSubpages.pl ('.$mw->{ua}->agent.')');
#   $mw->login({lgname => $username, lgpassword => $password});

#   return $mw;
# }
# # Process configuration options, including specific APi variables and getting
# # relevant username/password combination from the config file.  Config consists
# # of simple pairs of username and botpassword separated by a colon:
# # Jimbo Wales:stochasticstring
# # Config::General is easy but this is simple enough
# sub getConfig {
#   # Hashref holding configuration options
#   my $config = shift;
#   # Ensure full config
#   LOGDIE('No username provided') if ! defined ${$config}{username};

#   ${$config}{lang} ||= 'en';
#   ${$config}{family} ||= 'wikipedia';
#   ${$config}{url} ||= "https://${$config}{lang}.${$config}{family}.org";
#   # Just in case
#   my $trail = substr ${$config}{url}, -1;
#   chop ${$config}{url} if $trail eq q{/};

#   # Pop into this script's directory, mostly so config file access is easy
#   if (${$config}{rcdir}) {
#     ${$config}{rcdir} = $Bin.q{/}.${$config}{rcdir};
#   } else {
#     ${$config}{rcdir} = $Bin;
#   }
#   chdir ${$config}{rcdir} or LOGDIE('Failed to change directory');

#   my $correctname = ${$config}{username};
#   my ($un, $pw);
#   open my $rc, '<', '.crathighlighterrc' or LOGDIE($ERRNO);
#   while (my $line = <$rc>) {
#     chomp $line;
#     ($un, $pw) = split /:/, $line;
#     # Only accept the right user
#     last if $un =~ /^$correctname@/;
#   }
#   close $rc or LOGDIE($ERRNO);
#   # Only accept the right user
#   if ($un !~ /^$correctname@/) {
#     LOGDIE('Wrong user provided');
#   }
#   ${$config}{username} = $un;
#   ${$config}{password} = $pw;

#   return $config;
# }
# # Nicer handling of some specific mediawiki errors, can be expanded using:
# # - https://metacpan.org/release/MediaWiki-API/source/lib/MediaWiki/API.pm
# # - https://www.mediawiki.org/wiki/API:Errors_and_warnings#Standard_error_messages
# sub dieNice {
#   $mw = shift || $mw;		# Feels risky FIXME TODO
#   my $code = $mw->{error}->{code};
#   my $details = $mw->{error}->{details};

#   # Avoid an elsif ladder.  Could `use experimental qw(switch)` but don't really
#   # feel like it; this is probably more legible anyway
#   my %codes = (
# 	       2 => 'HTTP access',
# 	       3 => 'API access',
# 	       4 => 'logging in',
# 	       5 => 'editing the page'
# 	      );
#   my $message = $codes{$code} ? q{: }.$codes{$code} : q{};
#   $message = 'MediaWiki error'.$message.":\n$code: $details";
#   LOGDIE($message);
# }


# # Make sure the bot behaves nicely.  Slightly more involved since the two checks
# # are combined into one query, but in practice both of these are likely to be
# # run, so might as well save a query, and it's not so bad comparatively!
# sub botShutoffs {
#   my $botCheckQuery = {
# 		       action => 'query',
# 		       # Page content
# 		       prop => 'revisions',
# 		       titles => $bot.'/disable',
# 		       rvprop => 'content', # Don't care about much else
# 		       # Get user talk messages status
# 		       meta => 'userinfo',
# 		       uiprop => 'hasmsg',
# 		       format => 'json',
# 		       formatversion => 2
# 		      };
#   my $botCheckReturnQuery = $mw->api($botCheckQuery)->{query};
#   # Manual shutoff; confirm bot should actually run
#   # Arrows means no (de)referencing
#   my $checkContent = $botCheckReturnQuery->{pages}[0]->{revisions}[0]->{content};
#   if (!$checkContent || $checkContent ne '42') {
#     LOGDIE('DISABLED on-wiki');
#   }

#   # Automatic shutoff: user has talkpage messages.  Unlikely as it redirects to
#   # my main talk page, which I *don't* want to be an autoshutoff.
#   my $userNotes = $botCheckReturnQuery->{userinfo}->{messages};
#   if ($userNotes) {
#     LOGDIE("$bot has talkpage message(s))");
#   }
# }


# # Bulk query for getting the current list of rights holders, plus an ad hoc
# # check of the active/inactive list for ArbCom members.  Big subroutine that can
# # probably be split up, although admittedly it all fits together here.
# sub getCurrentGroups {
#   # @rights doesn't include arbcom or steward at the moment since it's first being
#   # used to build the query for determining local usergroups.  Steward belongs to
#   # a different, global list (agu rather than au) and arbcom isn't real.  They'll
#   # both be added in due course, although the arbcom list needs separate getting.
#   my @rights = qw (bureaucrat suppress checkuser interface-admin sysop);
#   # Will store hash of editors for each group.  Basically JSON as hash of hashes.
#   my %groupsData;

#   ## List of each group (actually a list of users in any of the chosen groups with
#   ## all of their respective groups).  $localPerms is also used for a grep later.
#   my $localPerms = join q{|}, @rights;
#   my $groupsQuery = {
# 		     action => 'query',
# 		     list => 'allusers|globalallusers',
# 		     augroup => $localPerms,
# 		     auprop => 'groups',
# 		     aulimit => 'max',
# 		     agugroup => 'steward',
# 		     agulimit => 'max',
# 		     format => 'json',
# 		     formatversion => 2,
# 		     utf8 => '1' # Alaa friendly
# 		    };
#   # JSON, technically a reference to a hash
#   # $mw->list doesn't work with multiple lists???  Lame
#   my $groupsReturn = $mw->api($groupsQuery);
#   # Hash containing each list as a key, with the results as an array of hashes,
#   # each hash containing the useris, user name, and (if requested) user groups
#   my %groupsQuery = %{${$groupsReturn}{query}};

#   # Stewards are "simple" thanks to map and simple (one-group) structure
#   %{$groupsData{steward}} = map {$_->{name} => 1} @{$groupsQuery{globalallusers}};
#   push @rights, qw (steward);


#   # Local groups need a loop for processing who goes where, but there are a lot of
#   # sysops, so we need to either get the bot flag or iterate over everyone
#   my @localHashes = @{$groupsQuery{allusers}}; # Store what we've got, for now
#   # If there's a continue item, then continue, by God!
#   while (exists ${$groupsReturn}{continue}) { # avoid autovivification
#     # Process the continue parameters
#     # Probably shit if there's another group that needs continuing
#     # FIXME TODO && aufrom
#     foreach (keys %{${$groupsReturn}{continue}}) {
#       ${$groupsQuery}{$_} = ${${$groupsReturn}{continue}}{$_}; # total dogshit
#     }

#     # Resubmit new query, using old query
#     $groupsReturn = $mw->api($groupsQuery);

#     # Overwrite original data, already stored in @localHashes and needed for
#     # iteration in this loop
#     %groupsQuery = %{${$groupsReturn}{query}};
#     # Append the new stuff
#     push @localHashes, @{$groupsQuery{allusers}};
#   }

#   findLocalGroupMembers(\@localHashes, $localPerms, \%groupsData);

#   # Get ArbCom.  Imperfect to rely upon this list being updated, but the Clerks
#   # are proficient and timely, and ArbCom membership is high-profile enough that
#   # this is updated quickly.  Previously, relied upon parsing
#   # [[Template:Arbitration_committee_chart/recent]] but that had annoying edge
#   # cases around December 30th and 31st, and is occasionally not updated as
#   # timely as the "official" members list, the latter being enshrined in AC/C/P.
#   my $acTemplate = 'Wikipedia:Arbitration Committee/Members';
#   my $acMembers = $mw->get_page({title => $acTemplate})->{q{*}};

#   findArbComMembers($acMembers, \%groupsData);
#   unshift @rights, qw (arbcom);

#   # Rename suppress to oversight
#   s/suppress/oversight/ for @rights;

#   # Need to return references since we're doing hash and array
#   return (\%groupsData, \@rights);
# }


=head2 findLocalGroupMembers

=cut

# Loop through each user's data and figure out what groups they've got.  Far
# from perfect; ideally I wouldn't use the @localHashes/$localData, but until
# I stop overwriting data on the continue, then it's a necessary hack
sub findLocalGroupMembers {
  my ($localData, $localRE, $dataHashRef) = @_;

  foreach my $userHash (@{$localData}) {
    # Limit to the groups in question (I always forget how neat grep is), then add
    # that user to the lookup for each group
    # Use map? FIXME TODO
    my @groups = grep {/$localRE/} @{${$userHash}{groups}};
    # Rename suppress to oversight, sigh
    s/suppress/oversight/ for @groups;

    foreach my $group (@groups) {
      ${$dataHashRef}{$group}{${$userHash}{name}} = 1;
    }
  }
}


=head2 findArbComMembers

=cut

# Proccess each line of the page content to get the users listed
# This could be smarter, since it's *only* doing arbcom, maybe it could just
# return the {arbcom} hash data, which gets assigned to %groupsData{arbcom}?
# FIXME TODO Don't add in replace, return an object
sub findArbComMembers {
  my ($fh, $dataHashRef) = @_;	# Rename fh FIXME TODO

  for (split /^/, $fh) {
    if (/^:#\{\{user\|(.*)}}/) {
      ${$dataHashRef}{arbcom}{$1} = 1;
    } elsif (/^:;<big>\{\{xtn\|/) {
      # Avoid listing former Arbs or Arbs-elect, which are occasionally found at
      # the bottom of the list during transitionary periods
      last;
    }
  }
}


# # Get the current content of each on-wiki page, so we can compare to see if
# # there are any updates needed
# sub getPageGroups {
#   my @rights = @_;
#   my @titles = map { $bot.'/crathighlighter.js/'.$_.'.json' } @rights;
#   my $allTitles = join q{|}, @titles;

#   # Could do this query with get_page but formatversion=2 makes things so much
#   # easier to iterate over
#   my $contentQuery = {
# 		      action => 'query',
# 		      prop => 'revisions',
# 		      rvprop => 'content',
# 		      titles => $allTitles,
# 		      format => 'json',
# 		      formatversion => 2
# 		     };
#   # JSON, technically a reference to a hash
#   my $contentReturn = $mw->api($contentQuery);
#   return processFileData($contentReturn);
# }

=head2 processFileData

=cut

# Build hash of array with per group page title, content, and last edited time
# Maybe something about formatversion 1 or 2??? FIXME TODO
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


=head2 gitOnMain

# These all mis/abuse @_ for brevity, rather than merely `shift`-ing

=cut

sub gitOnMain {
  return $_[0]->run('rev-parse' => '--abbrev-ref', 'HEAD') ne 'main';
}

=head2 gitCleanStatus

=cut

sub gitCleanStatus {
  return scalar $_[0]->run(status => '--porcelain');
}

=head2 gitSHA

=cut

sub gitSHA {
  return scalar $_[0]->run('rev-parse' => '--short', 'HEAD');
}

=head1 AUTHOR

Amory Meltzer, C<< <Amorymeltzer at gmail.com> >>

=head1 BUGS

Please report any bugs or feature requests to C<bug-amorybot-crathighlighter at rt.cpan.org>, or through
the web interface at L<https://rt.cpan.org/NoAuth/ReportBug.html?Queue=AmoryBot-CratHighlighter>.  I will be notified, and then you'll
automatically be notified of progress on your bug as I make changes.




=head1 SUPPORT

You can find documentation for this module with the perldoc command.

    perldoc AmoryBot::CratHighlighter


You can also look for information at:

=over 4

=item * RT: CPAN's request tracker (report bugs here)

L<https://rt.cpan.org/NoAuth/Bugs.html?Dist=AmoryBot-CratHighlighter>

=item * CPAN Ratings

L<https://cpanratings.perl.org/d/AmoryBot-CratHighlighter>

=item * Search CPAN

L<https://metacpan.org/release/AmoryBot-CratHighlighter>

=back


=head1 ACKNOWLEDGEMENTS


=head1 LICENSE AND COPYRIGHT

This software is Copyright (c) 2022 by Amory Meltzer.

This is free software, licensed under:

  The Artistic License 2.0 (GPL Compatible)


=cut

1; # End of AmoryBot::CratHighlighter
