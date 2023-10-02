package AmoryBot::CratHighlighter::GitUtils;

# Just for POD, toolforge has 5.028 as of late 2023
use 5.006;
use 5.006;
use strict;
use warnings;

use Git::Repository;

=head1 NAME

AmoryBot::CratHighlighter::GitUtils

=head1 VERSION

Version 0.01

=cut

our $VERSION = '0.01';

# Actually allow methods to be exported
use Exporter 'import';
our @EXPORT_OK = qw(gitOnMain gitCleanStatus gitSHA);
our %EXPORT_TAGS = ( all => \@EXPORT_OK);


=head1 SYNOPSIS

Quick summary of what the module does.

Perhaps a little code snippet.

    use AmoryBot::CratHighlighter::GitUtils;

    my $foo = AmoryBot::CratHighlighter::GitUtils->new();
    ...

=head1 EXPORT

A list of functions that can be exported.  You can delete this section
if you don't export anything, such as for a purely object-oriented module.

=head1 SUBROUTINES/METHODS

These all mis/abuse @_ for brevity, rather than merely `shift`-ing

=head2 gitOnMain

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

=head1 LICENSE AND COPYRIGHT

This software is Copyright (c) 2022 by Amory Meltzer.

This is free software, licensed under:

  The WTFPL


=cut

1; # End of AmoryBot::CratHighlighter::GitUtils
