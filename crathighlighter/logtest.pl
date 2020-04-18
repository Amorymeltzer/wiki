#!/usr/bin/env perl
# logtest.pl by Amory Meltzer
# test Log::Log4perl

use strict;
use warnings;
use diagnostics;

use Log::Log4perl;

my %conf = (
	    'log4perl.category.cratHighlighter' => 'TRACE, Logfile',
	    'log4perl.appender.Logfile' => 'Log::Log4perl::Appender::File',
	    'log4perl.appender.Logfile.filename' => 'crat.log',
	    'log4perl.appender.Logfile.layout' => 'Log::Log4perl::Layout::PatternLayout',
	    'log4perl.appender.Logfile.layout.ConversionPattern' => '%d (%p): %m%n'
	   );

Log::Log4perl::init(\%conf);

my $logger = Log::Log4perl->get_logger('cratHighlighter');
$logger->error('Blah');
$logger->warn('Blah');
$logger->info('Blah');
exit;




use Log::Dispatch;
use Log::Dispatch::File;
use Log::Dispatch::Screen;

my $log = Log::Dispatch->new();
$log->add(Log::Dispatch::File->new(
				   min_level => 'info',
				   filename  => 'crathighlighter.log',
				   # mode      => '>>',
				   mode      => '>',
				   newline   => 1
				  ));
$log->add(Log::Dispatch::Screen->new(min_level => 'warning'));


$log->emerg('emerg');
$log->warn('warn');
$log->info('info');
$log->log_and_die(level=>'warn', message=>'die');
