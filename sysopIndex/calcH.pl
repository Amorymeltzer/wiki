#!/usr/bin/env perl
# calcH.pl by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Bulk calculate s-index for a given directory

use 5.006;
use strict;
use warnings;
use diagnostics;
use English qw( -no_match_vars);
use Term::ProgressBar;

# Usage information
if (@ARGV != 3) {
  helpMenu();
}

opendir my $dir, "$ARGV[2]" or die $ERRNO;
my @files = grep {-f "$ARGV[2]/$_" } readdir $dir; # No dots
closedir $dir or die $ERRNO;

# Prepend directory name for full location as this will be passed on
foreach my $loc (0..scalar @files-1) {
  $files[$loc] = $ARGV[2].$files[$loc];
}

if ($ARGV[0] eq 'month' || $ARGV[0] eq 'roll1') {
  main('roll', \@files, 1,'Monthly');
} elsif ($ARGV[0] =~ m/roll\d+/i) {
  $ARGV[0] =~ s/roll(\d+)/$1/;
  main('roll', \@files,$ARGV[0],"Rolling $ARGV[0]");
} elsif ($ARGV[0] eq 'year' || $ARGV[0] eq 'fixed12') {
  # Find the first January and last december
  # Turned off until starting date options, since data starts in Jan 05
  # shift @files until $files[0] =~ /\d{4}-01\.csv/;
  # pop @files until $files[-1] =~ /\d{4}-12\.csv/;
  main('fixed',\@files,12,'Annual');
} elsif ($ARGV[0] =~ m/fixed\d+/i) {
  $ARGV[0] =~ s/fixed(\d+)/$1/;
  main('fixed', \@files,$ARGV[0],"Fixed $ARGV[0]");
}


# Subroutines
sub helpMenu {
  print "Usage: $PROGRAM_NAME <opt> <output> <directory>\n";
  print "month:\t\t Calculate month-to-month s-index (equivalent to roll1)\n";
  print "roll#:\t\t Calculate rolling s-index (e.g., roll3 for a 3-month count)\n";
  print "year:\t\t Calculate annual s-index (equivalent to fixed12)\n";
  print "fixed#:\t\t Calculate fixed-period  s-index (e.g., fixed6 for 6-month chunks)\n";
  exit 1;
}

sub main {
  my ($roll,$filesRef,$pin,$label) = @_;
  open my $outF, '>', "$ARGV[1]" or die $ERRNO;

  print $outF "Date,s-index,Total,s-index+nobot,Total+nobot\n";

  my $fileC = scalar @{$filesRef}-1;
  my $progress_bar = Term::ProgressBar->new({count=>$fileC, term_width=>80, name=>$label});
  foreach my $fileN (0..$fileC) {
    if (($fileN < $pin-1 && $roll eq 'roll') # Skip until enough for rolling
	|| $roll eq 'fixed' && $fileN % $pin != $pin-1) { # Skip until full year
      next;
    }

    my @passFile = @{$filesRef}[$fileN-$pin+1..$fileN];

    my $item = $roll eq 'roll' ? $passFile[-1] : $passFile[0];
    $item = (split /\.|\//, $item)[1];
    print $outF $item.q{,};

    $progress_bar->update($fileN);
    my $out = `perl sysopHindex.pl @passFile`;
    chomp $out;
    print $outF "$out\n";
  }
  close $outF or die $ERRNO;
  $progress_bar->update($fileC);
  print "\n";
  return;
}
