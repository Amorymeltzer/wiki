#!/usr/bin/env bash
# setup_perl by Amory Meltzer
# Set up my perl on a toolforge kube whatever


# Make CPAN always select the default option
export PERL_MM_USE_DEFAULT=1
# Use https with cpanm:
# http://blogs.perl.org/users/neilb/2021/11/addressing-cpan-vulnerabilities-related-to-checksums.html
export PERL_CPANM_OPT="--verify --from https://www.cpan.org"
# Generally the default but let's just make this explicit.  Used throughout.
export PERL5_DIR="$HOME/perl5"

# Yay perlbrew.  The default, but again, make explicit
export PERLBREW_ROOT="$PERL5_DIR/perlbrew"

# Install perlbrew
curl -L https://install.perlbrew.pl | bash

# Source perlbrew, build $PATH
. "$PERLBREW_ROOT/etc/bashrc"

# locallib install stuff
export PERL5LIB="$PERL5_DIR/lib/perl5${PERL5LIB:+:${PERL5LIB}}"
export PERL_LOCAL_LIB_ROOT="$PERL5_DIR${PERL_LOCAL_LIB_ROOT:+:${PERL_LOCAL_LIB_ROOT}}"
export PERL_MB_OPT="--install_base $PERL5_DIR"
export PERL_MM_OPT="INSTALL_BASE=/$PERL5_DIR"

perlbrew install-cpanm
perlbrew install --switch 5.36.0

# Install deps
cpanm --cpanfile ~/wiki/crathighlighter/cpanfile --installdeps .
