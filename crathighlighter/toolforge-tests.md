# Toolforge testing

Turns out, I was providing `PERL5LIB` in my crontab the whole time!  So it's not really much different.  Can maybe try in [jobs.yaml](https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/#using-environment-variables-inside-of-your-config)?  Still need to fix installation of modules, though.

## Location of modules

**Summary**: Need to pass `$PERL5LIB` to actually make the modules available, but issues with JSON::MaybeXS persist.  Maybe check the various dependencies/things it checks?  Seems likely:

- `Cpanel::JSON::XS`:`/data/project/amorybot/perl5/lib/perl5/x86_64-linux-gnu-thread-multi/Cpanel/JSON/XS.pm`
- `JSON::XS`: `/usr/lib/x86_64-linux-gnu/perl5/5.28/JSON/XS.pm`
- `JSON::PP`: `/usr/share/perl/5.28/JSON/PP.pm`

Installing all three via `cpanm` actually made it worse: `MediaWiki::API` is now broken?  Seems to be related to installing `JSON::XS`, as a dependency?  Same XS.c error.

**SO**: I have now installed Perl 5.36.0 on the tool account, so consider switching to that and reinstalling all modules.  Maybe that will solve things?

By itself: no, doesn't solve anything.  Still same issues; `JSON::MaybeXS` installed and available in new brewperl 5.36.0 installation, but k8s still fails as below.  That's largely because `@INC` is:

```text
@INC:
/etc/perl
/usr/local/lib/x86_64-linux-gnu/perl/5.36.0
/usr/local/share/perl/5.36.0
/usr/lib/x86_64-linux-gnu/perl5/5.36
/usr/share/perl5
/usr/lib/x86_64-linux-gnu/perl-base
/usr/lib/x86_64-linux-gnu/perl/5.36
/usr/share/perl/5.36
/usr/local/lib/site_perl
```

Prepending with the variable (`PERL5LIB='/data/project/amorybot/perl5/lib/perl5/'`) correctly places things in the @INC; so yeah, checks out!  Still some failures because...

**EXCEPT**: There is a huge difference between:

- `/data/project/amorybot/perl5/lib/perl5/`
- `/data/project/amorybot/perl5/perlbrew/perls/perl-5.36.0/lib/site_perl/5.36.0/`

The latter is seemingly where most of the things got installed?  Fucked if I know how or why.  The latter works perfectly when testing loading, so just use that I guess?!  Not sure why perlbrew uses one or the other.  Of note, with perlbrew, I'm not exporting `$PERL5LIB` in my `.bash_profile`, so that might not help.  Still, major progress!  (Could the difference be age?  It seems so!  Everything in the former was installed *before* switching and using a perlbrew-installed Perl, so yeah, that's gotta be it!)

So, maybe going forward: tweak .bash_profile, confirm a good $PERL5LIB, yay?  No, perlbrew `unset`s PERL5LIB intentionally, so, uh, just add manually?  Seems to work.  Testing:

- Nothing: Incomplete
- `/data/project/amorybot/perl5/lib/perl5/`: Incomplete
- `/data/project/amorybot/perl5/perlbrew/perls/perl-5.36.0/lib/site_perl/5.36.0/`: **SUCCESS**
- `/data/project/amorybot/perl5/perlbrew/perls/perl-5.36.0/lib/site_perl/`: **SUCCESS**
- `/data/project/amorybot/perl5/perlbrew/perls/perl-5.36.0/lib/`: Incomplete
- `/data/project/amorybot/perl5/perlbrew/perls/perl-5.36.0/`: Incomplete

**So**: They work!  For proveme.pl anyway.  Still an issue with Pod checks, though; I think that's related to not having access to the .perlcritic file?  I dunno.  But progress!  Could be a path issue!  Access to `perlcritic`, etc.  Not sure though; jobs run says can't find `perlcritic` but the path is there and accurate?!

**LOOK INTO**: Providing via `toolforge envvars`?  Looks good: <https://wikitech.wikimedia.org/wiki/Help:Toolforge/Envvars_Service>  Also see for `cron`, `logname`, etc.

ALSO: Check out .kube/config?

----

Going forward beyond this: Good idea could be to just use the system perl to install modules, yeah?  Would require a lot of setup, maybe.  setup.sh?  But maybe not URGENT to get working the first time around.  Could try in the webservice too--`webservice --backend=kubernetes perl5.36 shell`--but there are some issues, since that loads my .bashrc, .bash_profile, etc., whereas the `toolforge jobs run` doesn't.

### Plain

Doing the ol' `perl -MGit::Repository -e 'print $INC{"Git/Repository.pm"}'` trick for all my modules gives that `/usr/share/perl5/` has `Log::Log4perl` and `MediaWiki::API`, but not `Git::Repository`, `File::Slurper`, and `JSON::MaybeXS`.  Makes sense, since:

```text
@INC:
/etc/perl
/usr/local/lib/x86_64-linux-gnu/perl/5.36.0
/usr/local/share/perl/5.36.0
/usr/lib/x86_64-linux-gnu/perl5/5.36
/usr/share/perl5
/usr/lib/x86_64-linux-gnu/perl-base
/usr/lib/x86_64-linux-gnu/perl/5.36
/usr/share/perl/5.36
/usr/local/lib/site_perl
```

### Export

`toolforge jobs run wherejson-export --command "export PERL5LIB='/data/project/amorybot/perl5/lib/perl5/'; ./wherejson.sh" --image perl5.36` gave `Log::Log4perl`, `MediaWiki::API`, `Git::Repository`, and `File::Slurper`, but not `JSON::MaybeXS`.  Better!  The error: `XS.c: loadable library and perl binaries are mismatched (got first handshake key 0xce00080, needed 0xeb80080)`

### Variable

`toolforge jobs run wherejson-var --command "PERL5LIB='/data/project/amorybot/perl5/lib/perl5/' ./wherejson.sh" --image perl5.36`: As above

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
