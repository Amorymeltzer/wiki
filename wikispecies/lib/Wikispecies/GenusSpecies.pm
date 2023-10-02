package Wikispecies::GenusSpecies;

use 5.006;
use strict;
use warnings;

use English qw(-no_match_vars); # Avoid regex speed penalty in perl <=5.16

=head1 NAME

Wikispecies::GenusSpecies

=head1 VERSION

Version 0.01

=cut

our $VERSION = '0.01';


# Actually allow methods to be exported
use Exporter 'import';
our @EXPORT_OK = qw(noParens rmOdds noVars compareGP);
our %EXPORT_TAGS = ( all => \@EXPORT_OK);
our @EXPORT = qw(noParens rmOdds noVars compareGP);


=head1 SYNOPSIS

Basic functions for processing a list of Genus_species pairs and finding the
ones with identical names.  Modularized for fun, not for actual use.

=head1 EXPORT

A list of functions that can be exported.  You can delete this section
if you don't export anything, such as for a purely object-oriented module.

=head2 noParens

Gets rid of text contained in parentheses, as that denotes sub-genera/sub-species/etc.,
and replaces dual underscores with a single.

=cut

sub noParens {
  my $title = shift;
  $title =~ s/\(.*\)//x;       # get rid of text in parentheses
  $title =~ s/__/_/;           # potential formatting issue as a result of above
  return $title;
}

=head2 rmOdds

Removes various characters, namely:

=over

=item * '+'

=item * '?'

=item * '('

=item * ')'

=back

=cut

sub rmOdds {
  # Should maybe just remove the whole word after? FIXME TODO
  return shift =~ s/[\+\?\(\)]//gxr;  # odd characters
}

=head2 noVars

Gets rid of subspecies and variant names

=cut

sub noVars {
  my $title = shift;
  # Get rid of subspecies and variant names, remove if someone cares for those
  # FIXME TODO
  # _subsp. or _nothosubsp.
  # same for var.  Maybe also sp.?
  $title =~ s/subsp\..*$//x;
  $title =~ s/var\..*$//x;
  return $title;
}

=head2 compareGP

The actual comparison process

=cut

# Should probably be renamed FIXME TODO
sub compareGP {
  my @words = split /_/, shift; # array to hold each name

  if ((@words == 2) && (lc $words[0] eq lc $words[1])) {
    return @words;
  }
  return ();
}


# FIXME TODO
# Function for fetching the dumps

=head1 LICENSE AND COPYRIGHT

This software is Copyright (c) 2021 by Amory Meltzer.

This is free software, licensed under:

  The WTFPL http://www.wtfpl.net/

=cut

1; # End of Wikispecies::GenusSpecies
