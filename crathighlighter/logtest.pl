#!/usr/bin/env perl
# logtest.pl by Amory Meltzer
# test Log::Log4perl

use strict;
use warnings;
use diagnostics;

use Log::Log4perl qw(:easy);
# use Log::Log4perl qw(:easy :no_extra_logdie_message);

Log::Log4perl->easy_init( { level    => $INFO,
                            file     => '>>crathighlighter.log',
			    utf8     => 1,
                            layout   => '%p %F{1}-%L-%M: %m%n' },
                          { level    => $DEBUG,
                            file     => 'STDOUT',
                            layout   => '%p %m%n' },
                        );

ERROR('errrr');
WARN('wrn');
FATAL('fatall');
LOGWARN('logwarn');
LOGEXIT('logrxiot');
LOGDIE('logdie');
print "asdasd\n";
exit;

# Set logging config
my $layoutClass = 'Log::Log4perl::Layout::PatternLayout';
my %logConf = (
	       'log4perl.category.cratHighlighter' => 'TRACE, Logfile, Screen',

	       'log4perl.appender.Logfile' => 'Log::Log4perl::Appender::File',
	       'log4perl.appender.Logfile.filename' => 'crathighlighter.log',
	       'log4perl.appender.Logfile.layout' => $layoutClass,
	       'log4perl.appender.Logfile.layout.ConversionPattern' => '%d (%p): %m%n',

	       'log4perl.appender.Screen' => 'Log::Log4perl::Appender::Screen',
	       'log4perl.appender.Screen.layout' => $layoutClass,
	       'log4perl.appender.Screen.layout.ConversionPattern' => '%p: %m%n'
	      );

Log::Log4perl::init(\%logConf);

my $logger = Log::Log4perl->get_logger('cratHighlighter');
$logger->error('error');
$logger->warn('warn');
$logger->fatal('fatal');
$logger->info('info');
