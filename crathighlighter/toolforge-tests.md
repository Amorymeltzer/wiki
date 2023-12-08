# Toolforge testing

## gitSync.pl

**Summary**: Any option works

### Plain

`toolforge jobs run gitsync-plain --command "perl ~/wiki/crathighlighter/gitSync.pl" --image perl5.36`: ERROR

```text
Can't locate Git/Repository.pm in @INC (you may need to install the Git::Repository module) (@INC contains: /data/project/amorybot/wiki/crathighlighter/lib /etc/perl /usr/local/lib/x86_64-linux-gnu/perl/5.36.0 /usr/local/share/perl/5.36.0 /usr/lib/x86_64-linux-gnu/perl5/5.36 /usr/share/perl5 /usr/lib/x86_64-linux-gnu/perl-base /usr/lib/x86_64-linux-gnu/perl/5.36 /usr/share/perl/5.36 /usr/local/lib/site_perl) at /data/project/amorybot/wiki/crathighlighter/lib/AmoryBot/CratHighlighter/GitUtils.pm line 8.
BEGIN failed--compilation aborted at /data/project/amorybot/wiki/crathighlighter/lib/AmoryBot/CratHighlighter/GitUtils.pm line 8.
Compilation failed in require at /data/project/amorybot/wiki/crathighlighter/gitSync.pl line 28.
BEGIN failed--compilation aborted at /data/project/amorybot/wiki/crathighlighter/gitSync.pl line 28.
```

### `perl -I`

`toolforge jobs run gitsync-i --command "perl -I '/data/project/amorybot/perl5/lib/perl5/' ~/wiki/crathighlighter/gitSync.pl" --image perl5.36`: No output, so good?  Doing `toolforge jobs run gitsync-ii --command "perl -I '/data/project/amorybot/perl5/lib/perl5/' ~/wiki/crathighlighter/gitSync.pl && echo 'asd'" --image perl5.36` succeeded in outputting `asd` so yeah, worked!

### Export

`toolforge jobs run gitsync-export --command "export PERL5LIB='/data/project/amorybot/perl5/lib/perl5/'; perl ~/wiki/crathighlighter/gitSync.pl" --image perl5.36`: No output, so good!  `&& echo` worked.

### Variable

`toolforge jobs run gitsync-var --command "PERL5LIB='/data/project/amorybot/perl5/lib/perl5/' perl ~/wiki/crathighlighter/gitSync.pl && echo 'asd' || echo 'fail'" --image perl5.36`: Worked!

### `use lib`

`toolforge jobs run gitsync-lib --command "perl ~/wiki/crathighlighter/gitSync.pl && echo 'asd' || echo 'fail'" --image perl5.36`: Failed appropriately (as in, it loaded `Git::Repository` correctly), so works!

----

## proveme.pl

**Summary**: Mixed.  Because `proveme.pl` calls out to a separate process, the localib needs to be present beyond just the `perl -I` invocation and `use lib`.  That means that export/variable would work, as would `process_args`.  The PROBLEM, however, is that JSON::MaybeXS isn't present.

### Plain

`toolforge jobs run proveme-plain --command "perl ~/wiki/crathighlighter/proveme.pl" --image perl5.36`: Failed tests 'cause couldn't load libraries.

Out:

```text
Bailout called.  Further testing stopped:  Couldn't load module AmoryBot::CratHighlighter::GitUtils

Test Summary Report
-------------------
t/00-load.t             (Wstat: 65280 (exited 255) Tests: 3 Failed: 1)
  Failed test:  3
  Non-zero exit status: 255
  Parse errors: No plan found in TAP output
Files=1, Tests=3,  1 wallclock secs ( 0.04 usr  0.01 sys +  0.09 cusr  0.04 csys =  0.18 CPU)
Result: FAIL
```

Err:

```text
#   Failed test 'use AmoryBot::CratHighlighter::GitUtils;'
#   at t/00-load.t line 17.
#     Tried to use 'AmoryBot::CratHighlighter::GitUtils'.
#     Error:  Can't locate Git/Repository.pm in @INC (you may need to install the Git::Repository module) (@INC contains: /data/project/amorybot/wiki/crathighlighter/lib /etc/perl /usr/local/lib/x86_64-linux-gnu/perl/5.36.0 /usr/local/share/perl/5.36.0 /usr/lib/x86_64-linux-gnu/perl5/5.36 /usr/share/perl5 /usr/lib/x86_64-linux-gnu/perl-base /usr/lib/x86_64-linux-gnu/perl/5.36 /usr/share/perl/5.36 /usr/local/lib/site_perl) at /data/project/amorybot/wiki/crathighlighter/lib/AmoryBot/CratHighlighter/GitUtils.pm line 8.
# BEGIN failed--compilation aborted at /data/project/amorybot/wiki/crathighlighter/lib/AmoryBot/CratHighlighter/GitUtils.pm line 8.
# Compilation failed in require at t/00-load.t line 17.
# BEGIN failed--compilation aborted at t/00-load.t line 17.
FAILED--Further testing stopped: Couldn't load module AmoryBot::CratHighlighter::GitUtils
```

### `perl -I`

`toolforge jobs run proveme-i --command "perl -I '/data/project/amorybot/perl5/lib/perl5/' ~/wiki/crathighlighter/proveme.pl" --image perl5.36`: Failed, couldn't load libraries.

Out:

```text
Bailout called.  Further testing stopped:  Couldn't load module AmoryBot::CratHighlighter::GitUtils

Test Summary Report
-------------------
t/00-load.t             (Wstat: 65280 (exited 255) Tests: 3 Failed: 1)
  Failed test:  3
  Non-zero exit status: 255
  Parse errors: No plan found in TAP output
Files=1, Tests=3,  1 wallclock secs ( 0.01 usr  0.02 sys +  0.08 cusr  0.02 csys =  0.13 CPU)
Result: FAIL
```

Err:

```text
#   Failed test 'use AmoryBot::CratHighlighter::GitUtils;'
#   at t/00-load.t line 17.
#     Tried to use 'AmoryBot::CratHighlighter::GitUtils'.
#     Error:  Can't locate Git/Repository.pm in @INC (you may need to install the Git::Repository module) (@INC contains: /data/project/amorybot/wiki/crathighlighter/lib /etc/perl /usr/local/lib/x86_64-linux-gnu/perl/5.36.0 /usr/local/share/perl/5.36.0 /usr/lib/x86_64-linux-gnu/perl5/5.36 /usr/share/perl5 /usr/lib/x86_64-linux-gnu/perl-base /usr/lib/x86_64-linux-gnu/perl/5.36 /usr/share/perl/5.36 /usr/local/lib/site_perl) at /data/project/amorybot/wiki/crathighlighter/lib/AmoryBot/CratHighlighter/GitUtils.pm line 8.
# BEGIN failed--compilation aborted at /data/project/amorybot/wiki/crathighlighter/lib/AmoryBot/CratHighlighter/GitUtils.pm line 8.
# Compilation failed in require at t/00-load.t line 17.
# BEGIN failed--compilation aborted at t/00-load.t line 17.
FAILED--Further testing stopped: Couldn't load module AmoryBot::CratHighlighter::GitUtils
```

### Export

`toolforge jobs run proveme-export --command "export PERL5LIB='/data/project/amorybot/perl5/lib/perl5/'; perl ~/wiki/crathighlighter/proveme.pl" --image perl5.36`: Failed on `$ENV{LOGNAME}` and JSON::MaybeXS:

```text
Use of uninitialized value $ENV{"LOGNAME"} in string eq at t/01-git.t line 11.
XS.c: loadable library and perl binaries are mismatched (got first handshake key 0xce00080, needed 0xeb80080)
XS.c: loadable library and perl binaries are mismatched (got first handshake key 0xce00080, needed 0xeb80080)
XS.c: loadable library and perl binaries are mismatched (got first handshake key 0xce00080, needed 0xeb80080)
```

#### LOGNAME provision

Notably, though, providing a valid `$LOGNAME`, such as via `toolforge jobs run proveme-export-log --command "export PERL5LIB='/data/project/amorybot/perl5/lib/perl5/'; LOGNAME='amory' perl ~/wiki/crathighlighter/proveme.pl" --image perl5.36`, gives a partial success, with the same results as in the below example with `process_args`.  That is, fails to load JSON::MaybeXS and test::Perl::Critic and Test::Pod and Test::Pod::Coverage.

### Variable

`toolforge jobs run proveme-var --command "PERL5LIB='/data/project/amorybot/perl5/lib/perl5/' perl ~/wiki/crathighlighter/proveme.pl" --image perl5.36`: Failed as above on `$ENV{LOGNAME}` and JSON::MaybeXS:

```text
Use of uninitialized value $ENV{"LOGNAME"} in string eq at t/01-git.t line 11.
XS.c: loadable library and perl binaries are mismatched (got first handshake key 0xce00080, needed 0xeb80080)
XS.c: loadable library and perl binaries are mismatched (got first handshake key 0xce00080, needed 0xeb80080)
XS.c: loadable library and perl binaries are mismatched (got first handshake key 0xce00080, needed 0xeb80080)
```

### `use lib`

`toolforge jobs run proveme-lib --command "perl ~/wiki/crathighlighter/proveme.pl" --image perl5.36`: Failed, couldn't load modules; just as above in `perl -I`

Out:

```text
Bailout called.  Further testing stopped:  Couldn't load module AmoryBot::CratHighlighter::GitUtils

Test Summary Report
-------------------
t/00-load.t             (Wstat: 65280 (exited 255) Tests: 3 Failed: 1)
  Failed test:  3
  Non-zero exit status: 255
  Parse errors: No plan found in TAP output
Files=1, Tests=3,  0 wallclock secs ( 0.03 usr  0.02 sys +  0.08 cusr  0.02 csys =  0.15 CPU)
Result: FAIL
```

Err:

```text
#   Failed test 'use AmoryBot::CratHighlighter::GitUtils;'
#   at t/00-load.t line 17.
#     Tried to use 'AmoryBot::CratHighlighter::GitUtils'.
#     Error:  Can't locate Git/Repository.pm in @INC (you may need to install the Git::Repository module) (@INC contains: /data/project/amorybot/wiki/crathighlighter/lib /etc/perl /usr/local/lib/x86_64-linux-gnu/perl/5.36.0 /usr/local/share/perl/5.36.0 /usr/lib/x86_64-linux-gnu/perl5/5.36 /usr/share/perl5 /usr/lib/x86_64-linux-gnu/perl-base /usr/lib/x86_64-linux-gnu/perl/5.36 /usr/share/perl/5.36 /usr/local/lib/site_perl) at /data/project/amorybot/wiki/crathighlighter/lib/AmoryBot/CratHighlighter/GitUtils.pm line 8.
# BEGIN failed--compilation aborted at /data/project/amorybot/wiki/crathighlighter/lib/AmoryBot/CratHighlighter/GitUtils.pm line 8.
# Compilation failed in require at t/00-load.t line 17.
# BEGIN failed--compilation aborted at t/00-load.t line 17.
FAILED--Further testing stopped: Couldn't load module AmoryBot::CratHighlighter::GitUtils
```

### `process_args`

`toolforge jobs run proveme-processargs --command "perl ~/wiki/crathighlighter/proveme.pl" --image perl5.36`: Using `$app->process_args(('-l', '-Q', '-I', '/data/project/amorybot/perl5/lib/perl5/'));`, mostly works, but fails on JSON::MaybeXS and test::Perl::Critic and Test::Pod and Test::Pod::Coverage.  Not ideal but okay!

Out:

```text
Test Summary Report
-------------------
t/10-file.t             (Wstat: 256 (exited 1) Tests: 0 Failed: 0)
  Non-zero exit status: 1
  Parse errors: No plan found in TAP output
t/20-findGroupMembers.t (Wstat: 256 (exited 1) Tests: 0 Failed: 0)
  Non-zero exit status: 1
  Parse errors: No plan found in TAP output
t/30-botShutoffs.t      (Wstat: 256 (exited 1) Tests: 0 Failed: 0)
  Non-zero exit status: 1
  Parse errors: No plan found in TAP output
t/98-pc.t               (Wstat: 512 (exited 2) Tests: 0 Failed: 0)
  Non-zero exit status: 2
  Parse errors: No plan found in TAP output
t/99-pod-coverage.t     (Wstat: 512 (exited 2) Tests: 0 Failed: 0)
  Non-zero exit status: 2
  Parse errors: No plan found in TAP output
Files=15, Tests=68,  5 wallclock secs ( 0.10 usr  0.05 sys +  1.80 cusr  0.60 csys =  2.55 CPU)
Result: FAIL
```

Err:

```text
XS.c: loadable library and perl binaries are mismatched (got first handshake key 0xce00080, needed 0xeb80080)
XS.c: loadable library and perl binaries are mismatched (got first handshake key 0xce00080, needed 0xeb80080)
XS.c: loadable library and perl binaries are mismatched (got first handshake key 0xce00080, needed 0xeb80080)
Couldn't require Perl::Critic::Policy::Subroutines::ProhibitNestedSubs : Can't locate IO/String.pm in @INC (you may need to install the IO::String module) (@INC contains: /data/project/amorybot/wiki/crathighlighter/lib /data/project/amorybot/perl5/lib/perl5/x86_64-linux-gnu-thread-multi /data/project/amorybot/perl5/lib/perl5 /etc/perl /usr/local/lib/x86_64-linux-gnu/perl/5.36.0 /usr/local/share/perl/5.36.0 /usr/lib/x86_64-linux-gnu/perl5/5.36 /usr/share/perl5 /usr/lib/x86_64-linux-gnu/perl-base /usr/lib/x86_64-linux-gnu/perl/5.36 /usr/share/perl/5.36 /usr/local/lib/site_perl) at /data/project/amorybot/perl5/lib/perl5/Perl/Critic/Utils/POD.pm line 9.
...
```

----

## cratHighlighterSubpages.pl

**Summary**:

### Plain

### `perl -I`

### Export

### Variable

### `use lib`
