#!/usr/bin/env perl
# Test shared Log::Log4perl setup

use 5.036;

use English;

use File::Temp    qw(tempfile);
use Log::Log4perl qw(:easy);

use AmoryBot::CratHighlighter qw (initLogging);
use Test::More;
use Test::Fatal qw(exception);

plan tests => 7;


# Bad data
like(exception {initLogging()}, qr/Missing data/, 'No logfile');
# Nonexistent aka not writable
like(exception {initLogging('/fake-path/log.log')}, qr/No such file or directory/, 'Unwritable logfile');


# Create a temporary logfile.  Got to basically redo it every time since each
# invocation of easy_init (via initLogging) reconfigures the whole thang.
# initLogging enables trace logging via STDOUT unless CRON is set, so test on
# and off states throughout
my (undef, $logfile) = tempfile(UNLINK => 1);
{
  local $ENV{CRON} = 1;

  initLogging($logfile);
  INFO('hello');
}
# Gotta be a better way to confirm the format?
like(readLog($logfile), qr/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \(INFO\): hello$/m, 'message logged in expected format');


# quiet (the -L flag) should suppress everything, per the usage statement
(undef, $logfile) = tempfile(UNLINK => 1);
my $stdout;
{
  delete local $ENV{CRON};

  initLogging($logfile, 1);
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

  initLogging($logfile);
  $stdout = captureStdout(sub { INFO('interactive run') });
}
like($stdout, qr/ - interactive run$/m, 'CRON unset: STDOUT trace logger is active');

(undef, $logfile) = tempfile(UNLINK => 1);
{
  local $ENV{CRON} = 1;
  initLogging($logfile);
  $stdout = captureStdout(sub { INFO('automated run') });
}
is($stdout, q{}, 'CRON set: STDOUT trace logger is not active');


# Read a logfile to confirm messages actually get there
sub readLog {
  open my $fh, '<', shift or return q{};
  local $INPUT_RECORD_SEPARATOR = undef;
  return <$fh> // q{};
}

# Capture everything written to STDOUT.  Log4perl's STDOUT appender binds the
# real filehandle directly, so a mere select() isn't enough to intercept it;
# dup/close/reopen the actual filehandle instead.  FIXME TODO DON'T UNDERSTAND
# THIS
sub captureStdout {
  my $code     = shift;
  my $captured = q{};
  open my $oldStdout, '>&', \*STDOUT or die "dup failed: $ERRNO";
  close STDOUT or die $ERRNO;
  open STDOUT, '>', \$captured or die "reopen failed: $ERRNO";
  $code->();
  open STDOUT, '>&', $oldStdout or die "restore failed: $ERRNO";
  return $captured;
}
