package AmoryBot::CratHighlighter::GitUtils;

use 5.036;

use Git::Repository;

=head1 NAME

AmoryBot::CratHighlighter::GitUtils

=head1 VERSION

Version 0.1

=cut

# Not actually used anywhere...
our $VERSION = '0.1';

# Actually allow methods to be exported
use Exporter 'import';
our @EXPORT_OK   = qw(gitOnMain gitIsDirty gitSHA);
our %EXPORT_TAGS = (all => \@EXPORT_OK);


=head1 SYNOPSIS

Small helpers for checking the state of a local Git repository, used by
F<gitSync.pl>.

=head1 EXPORTS

=over 2

=item * L</gitOnMain>

=item * L</gitIsDirty>

=item * L</gitSHA>

=back

=head1 SUBROUTINES/METHODS

These all mis/abuse @_ for brevity, rather than merely `shift`-ing

=head2 gitOnMain

True if the current branch is C<main>.

=cut

sub gitOnMain {
  return $_[0]->run('rev-parse' => '--abbrev-ref', 'HEAD') eq 'main';
}

=head2 gitIsDirty

True if there are any uncommitted (or untracked) changes.

=cut

sub gitIsDirty {
  return scalar $_[0]->run(status => '--porcelain');
}

=head2 gitSHA

Get a short SHA.

=cut

sub gitSHA {
  return scalar $_[0]->run('rev-parse' => '--short', 'HEAD');
}


=head1 AUTHOR

Amory Meltzer, C<< <Amorymeltzer at gmail.com> >>

=head1 LICENSE AND COPYRIGHT

This software is Copyright (c) 2022 by Amory Meltzer.

This is free software, licensed under:

  The WTFPL


=cut

1;
