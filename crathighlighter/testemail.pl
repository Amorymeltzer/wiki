#!/usr/bin/env perl
# testemail by Amory Meltzer

use 5.006;
use strict;
use warnings;
use English;

use Log::Log4perl;

my $conf = q(
log4perl.category = FATAL, Mailer
log4perl.appender.Mailer         = Log::Dispatch::Email::MailSend
log4perl.appender.Mailer.to      = tools.amorybot@toolforge.org
log4perl.appender.Mailer.subject = Something's broken!
log4perl.appender.Mailer.layout  = SimpleLayout
log4perl.appender.Mailer.buffered = 0
);
Log::Log4perl::init( \$conf );

my $logger = Log::Log4perl->get_logger();

$logger->logdie('asd');
