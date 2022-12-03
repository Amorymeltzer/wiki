package AmoryBot::CratHighlighter::GitUtils;

use 5.006;			# FIXME TODO
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
our @EXPORT = \@EXPORT_OK;


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

=head1 BUGS

Please report any bugs or feature requests to C<bug-amorybot-crathighlighter-gitutils at rt.cpan.org>, or through
the web interface at L<https://rt.cpan.org/NoAuth/ReportBug.html?Queue=AmoryBot-CratHighlighter-GitUtils>.  I will be notified, and then you'll
automatically be notified of progress on your bug as I make changes.




=head1 SUPPORT

You can find documentation for this module with the perldoc command.

    perldoc AmoryBot::CratHighlighter::GitUtils


You can also look for information at:

=over 4

=item * RT: CPAN's request tracker (report bugs here)

L<https://rt.cpan.org/NoAuth/Bugs.html?Dist=AmoryBot-CratHighlighter-GitUtils>

=item * CPAN Ratings

L<https://cpanratings.perl.org/d/AmoryBot-CratHighlighter-GitUtils>

=item * Search CPAN

L<https://metacpan.org/release/AmoryBot-CratHighlighter-GitUtils>

=back


=head1 ACKNOWLEDGEMENTS


=head1 LICENSE AND COPYRIGHT

This software is Copyright (c) 2022 by Amory Meltzer.

This is free software, licensed under:

  The Artistic License 2.0 (GPL Compatible)


=cut

1; # End of AmoryBot::CratHighlighter::GitUtils
