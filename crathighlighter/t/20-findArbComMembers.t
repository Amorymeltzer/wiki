#!/usr/bin/env perl
# Tests for ArbCom template processing

use 5.036;

use File::Slurper qw(read_text);

use AmoryBot::CratHighlighter qw (findArbComMembers);
use Test::More;
use Test::Fatal qw(exception);

my @testFiles = ('arbcom_members.txt', 'arbcom_members_former.txt', 'arbcom_members_elect.txt', 'arbcom_members_old.txt', 'arbcom_members_former_old.txt', 'arbcom_members_elect_old.txt', 'arbcom_members_elect_span_colon.txt', 'arbcom_members_elect_span_bold.txt');
my %quirks    = (
  extraSpace   => ["#  {{user|Foo}}\n",                                                                                                  ['Foo']],
  trailingText => ["# {{user|Foo}} {{small|(chair)}}\n",                                                                                 ['Foo']],
  paddedName   => ["#{{user| Foo }}\n",                                                                                                  ['Foo']],
  colonPrefix  => [":# {{user|Foo}}\n:# {{user|Bar}}\n",                                                                                 ['Bar', 'Foo']],
  restyled     => ["#{{user|Foo}}\n'''{{big|{{xt|{{vanchor|Outgoing arbitrators}}}}}}'''\n#{{user|Bar}}\n",                              ['Foo']],
  otherColor   => ["#{{user|Foo}}\n'''{{big|{{!xt|{{vanchor|Arbitrators-elect (taking office 1 January 2027)}}}}}}'''\n#{{user|Bar}}\n", ['Foo']],
  bigTag       => ["#{{user|Foo}}\n<big>Arbitrators-elect</big>\n#{{user|Bar}}\n",                                                       ['Foo']],
  plainHead    => ["#{{user|Foo}}\n'''Outgoing arbitrators'''\n#{{user|Bar}}\n",                                                         ['Foo']],
  incoming     => ["#{{user|Foo}}\n'''Incoming arbitrators'''\n#{{user|Bar}}\n",                                                         ['Foo']],
  newlyElected => ["#{{user|Foo}}\n'''Newly elected arbitrators'''\n#{{user|Bar}}\n",                                                    ['Foo']],
  spaceElect   => ["#{{user|Foo}}\n'''Arbitrators elect'''\n#{{user|Bar}}\n",                                                            ['Foo']],
  introNote    => ["Intro <!--\"Outgoing arbitrators\" are arbitrators who are elected-->\n#{{user|Foo}}\n#{{user|Bar}}\n",              ['Bar', 'Foo']]

);

plan tests => 1 + scalar @testFiles + scalar keys %quirks;

# Bad data
like(exception {findArbComMembers()}, qr/Missing data/, 'No data');

# Official list compared to testing pages, minor changes to handle sorting
# differences and resignations
my @arbcom = ('Barkeep49', 'Beeblebrox', 'Cabayi', 'CaptainEek', 'Enterprisey', 'GeneralNotability', 'Guerillero', 'Izno', 'L235', 'Moneytrees', 'Opabinia regalis', 'Primefac', 'SilkTork', 'Wugapodes');

foreach my $file (@testFiles) {
  # This could be made even simpler by just using a direct reference and not
  # bothering with the hash, but this mimics the actual running design.
  my %groupsData;
  $groupsData{arbcom} = findArbComMembers(read_text("t/$file"));

  my @users = sort keys %{$groupsData{arbcom}};
  is_deeply(\@users, \@arbcom, "$file");
}

foreach my $quirk (sort keys %quirks) {
  my @users = sort keys %{findArbComMembers($quirks{$quirk}[0])};
  is_deeply(\@users, $quirks{$quirk}[1], $quirk);
}
