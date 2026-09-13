#!/usr/bin/env perl
# Test shared Log::Log4perl setup

use 5.036;

use English;
use autodie;

use File::Temp    qw(tempfile);
use Log::Log4perl qw(:easy);

use AmoryBot::CratHighlighter qw (configLogging);
use Test::More;
use Test::Fatal qw(exception);

plan tests => 11;


# Bad data
like(exception {configLogging()}, qr/Missing data/, 'No logfile');
# Nonexistent aka not writable
like(exception {configLogging('/fake-path/log.log')}, qr/No such file or directory/, 'Unwritable logfile');


my (undef, $configFile) = tempfile(UNLINK => 1);
my $infoLayout       = '%d{yyyy-MM-dd HH:mm:ss} (%p): %m{indent}%n';
my $traceLayout      = '%d - %m{indent}%n';
my $expectedInfo     = {level => 'INFO',  file => ">>$configFile", utf8   => 1, layout => $infoLayout};
my $expectedInfoOff  = {level => 'OFF',   file => ">>$configFile", utf8   => 1, layout => $infoLayout};
my $expectedTrace    = {level => 'TRACE', file => 'STDOUT',        layout => $traceLayout};
my $expectedTraceOff = {level => 'OFF',   file => 'STDOUT',        layout => $traceLayout};

{
  local $ENV{CRON} = 1;
  is_deeply([configLogging($configFile)],    [$expectedInfo],    'CRON: info');
  is_deeply([configLogging($configFile, 1)], [$expectedInfoOff], 'CRON + quiet: info OFF');
}
{
  delete local $ENV{CRON};
  is_deeply([configLogging($configFile)],    [$expectedInfo,    $expectedTrace],    'CRON off: info and trace');
  is_deeply([configLogging($configFile, 1)], [$expectedInfoOff, $expectedTraceOff], 'CRON off + quiet: info and trace OFF');
}


# Create a temporary logfile.  Got to basically redo it every time since each
# invocation of easy_init (via configLogging) reconfigures the whole thang.
# configLogging enables trace logging via STDOUT unless CRON is set, so test on
# and off states throughout.  These init logging to do a kind of integration
# test for each.
my (undef, $logfile) = tempfile(UNLINK => 1);
{
  local $ENV{CRON} = 1;

  Log::Log4perl->easy_init(configLogging($logfile));
  INFO('hello');
}
# Gotta be a better way to confirm the format?
like(readLog($logfile), qr/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \(INFO\): hello$/m, 'message logged in expected format');


# quiet (the -L flag) should suppress everything, per the usage statement
(undef, $logfile) = tempfile(UNLINK => 1);
my $stdout;
{
  delete local $ENV{CRON};

  Log::Log4perl->easy_init(configLogging($logfile, 1));
  $stdout = captureStdout(sub {INFO('should not appear')});
}
is(readLog($logfile), q{}, 'quiet suppresses file logging entirely');
is($stdout,           q{}, 'quiet also suppresses STDOUT trace logging');


# CRON is how the scripts distinguish an automated (k8s) run from an
# interactive one: unset, the STDOUT trace logger should be active; set, it
# shouldn't be.  Confirm both halves directly, by actually capturing STDOUT,
# rather than just avoiding the noise and hoping it works.
(undef, $logfile) = tempfile(UNLINK => 1);
{
  delete local $ENV{CRON};

  Log::Log4perl->easy_init(configLogging($logfile));
  $stdout = captureStdout(sub {INFO('interactive run')});
}
like($stdout, qr/ - interactive run$/m, 'CRON unset: STDOUT trace logger is active');

(undef, $logfile) = tempfile(UNLINK => 1);
{
  local $ENV{CRON} = 1;
  Log::Log4perl->easy_init(configLogging($logfile));
  $stdout = captureStdout(sub {INFO('automated run')});
}
is($stdout, q{}, 'CRON set: STDOUT trace logger is not active');


# Read a logfile to confirm messages actually get there
sub readLog {
  open my $fh, '<', shift;
  my $content = do {local $INPUT_RECORD_SEPARATOR = undef; <$fh>};
  close $fh;
  return $content;
}

# Capture everything written to STDOUT.  Log4perl's STDOUT appender binds the
# real filehandle directly, so a mere select() isn't enough to intercept it;
# dup/close/reopen the actual filehandle instead.  FIXME TODO DON'T REALLY
# UNDERSTAND THIS
sub captureStdout {
  my $code     = shift;
  my $captured = q{};
  # Dup
  open my $oldStdout, '>&', \*STDOUT;
  close STDOUT;
  # Reopen
  open STDOUT, '>', \$captured;
  $code->();
  # Restore
  open STDOUT, '>&', $oldStdout;
  close $oldStdout;

  return $captured;
}
