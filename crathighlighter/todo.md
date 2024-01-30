# Todos

- [ ] Alert if warnings detected, or something like that.  MediaWiki::API should really have a method for this kind of thing.
- [ ] Can `use 5.036` since we know the k8s image guarantees 5.36(.0), so yay?  `say` and `try/catch` maybe

## Set up Toolforge for Kubernetes: <https://wikitech.wikimedia.org/wiki/Help:Toolforge/Kubernetes>

- [x] yaml file to replace crontab.crontab: <https://wikitech.wikimedia.org/wiki/Help:Toolforge/Jobs_framework#Loading_jobs_from_a_YAML_file>
- [x] Install Perl 5.36 and subsequent modules via Perlbrew and cpanm
- [x] Replace all cron runs
  - [x] gitSync.pl
  - [x] proveme.pl
  - [x] cratHighlighterSubpages.pl
  - [x] cron_shim.sh
  - [x] log rotation
- [ ] Set up notification emails.  Doesn't work for toolforge-jobs (<https://wikitech.wikimedia.org/wiki/Help:Toolforge/Email#Sending_via_the_command_line>), and since `onfinish` does it no matter what, then maybe consider <https://metacpan.org/dist/Log-Log4perl/view/lib/Log/Log4perl/FAQ.pm> if necessary.  See also <https://metacpan.org/pod/Email::Simple> and <https://perldoc.perl.org/5.39.4/perlfaq9#How-do-I-send-email?>
- [ ] Look into retry
- [x] Reenable read-only stuff?  Nah, just remove
- [x] Move botpasswords/secrets to envvars
- [x] Annoying not having `$PATH` set and doing manually for proveme.pl, perhaps setup_perl.sh can deal with this?  Prob not.
- [x] Consider setup_perl.sh for installing modules via system Perl /usr/bin/perl (might mean just running scripts via system Perl?) or even just setup?  Meh, unneeded atm
- [ ] Look into .kube/config

## Main module

- Split out main loop somehow
- [x] Split out note creation (note and updateNote) (done but poorly)
- [ ] Possible to improve note creation?
- [ ] If I completely rework the main loop for each group, the note can just be saved, and can use that for the email/output message?  Would avoid some extraneous stuff (`@localChange`, `@wikiChange`, etc.)
- Maybe split cmpJSON?  Why?  Figure out JSON::MaybeXS, etc.  Tricky.
- Somehow handle MediaWiki::API stuff, maybe OO?  Ugh
- [x] Split out git stuff into separate module?  Separate script.  But then again, only used there and I don't bother testing it much, so pointless?
- Log::Log4perl stuff only in main script, getConfig, and various API-related things.  Could do that only in separate module?  Stupid?  Definitely stupid.
- [x] Restructure `findLocalGroupMembers` to use return
- [x] Consider restructuring around mapGroups and formatting email/note?  Currently awful.
- processFileData is too group/user-focused(?)
- Cleanup module pod

## Speedups

- [x] findLocalGroupMembers
- [x] cmpJSON
- [ ] Combine the two main queries?  Yes I think so: it would require reworking @rights/$groups handling and all that, but should make things faster since the queries are the only real bottlenecks, plus it's nicer!
- [ ] Rework `getCurrentGroups` to just be API stuff, thus pulling out group processing?  Will need an intermediate storage hash, but especially if the page content query is combine (as above) then it would be cleaner, with fewer subs and the like.  Might even make testing some items easier.  Likewise, connects with some ideals of removing more and more stuff from being connected to the API (see section below).
- [ ] Is it faster to query for `auprop=>'groups'` as I do currently, or is it faster to query for `auprop=>'rights'`?  The former might be slower on the server side, but the latter would require going through a lot of different arrays to look for the few that I need...

## Tests

- [x] Text
- [x] Disable
- Posting?
- Logging?
- Exceptions?

## All subs

- [ ] Make a lot of `return`s be `die`/`croak` instead?  Might not make sense to `return undef`.
- [ ] Add `on_error` to `buildMW`

### Git

- [x] gitOnMain
- [x] gitCleanStatus
- [x] gitSHA

### API - sub module?

- [x] mwLogin - dieNice, which implies logging as well <https://metacpan.org/dist/Log-Log4perl/view/lib/Log/Log4perl/FAQ.pm#My-new-module-uses-Log4perl-but-what-happens-if-the-calling-program-didn't-configure-it?> and <https://metacpan.org/dist/Log-Log4perl/view/lib/Log/Log4perl/FAQ.pm#My-new-module-uses-Log4perl-but-what-happens-if-the-calling-program-didn't-configure-it?>  But also maybe can add later?  If pull all logging out could be local, and can at least confirm it exists, user agent, etc.  Might even make more sense to log in separate from building the object?  Probably the only one that makes sense, so seems silly to do a whole new module just for this.  Currently copied for testing.
- [ ] dieNice - Ideally would take in self, PR opened.
- [ ] botQuery - Logging?
- [ ] getCurrentGroups Need to remove need for rights from the script, no need for that to be in there
- [ ] getPageGroups

### Local

- [x] findArbComMembers
- [x] findLocalGroupMembers
- [x] processFileData
- [x] cmpJSON
- [x] changeSummary
- [x] oxfordComma
- [x] mapGroups
