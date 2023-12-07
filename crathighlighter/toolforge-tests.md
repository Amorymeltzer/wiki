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

## proveMe.pl

**Summary**:

### Plain

### `perl -I`

### Export

### Variable

### `use lib`

### `process_args`

----

## cratHighlighterSubpages.pl

**Summary**:

### Plain

### `perl -I`

### Export

### Variable

### `use lib`
