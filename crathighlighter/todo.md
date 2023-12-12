# Todos

- [ ] Alert if warnings detected, or something like that.  MediaWiki::API should really have a method for this kind of thing.

## Set up Toolforge for Kubernetes: <https://wikitech.wikimedia.org/wiki/Help:Toolforge/Kubernetes>

- [x] yaml file to replace crontab.crontab: <https://wikitech.wikimedia.org/wiki/Help:Toolforge/Jobs_framework#Loading_jobs_from_a_YAML_file>
- [ ] Replace all cron runs
  - [x] gitSync.pl
  - [ ] proveme.pl (issue with perlcritic and POD?)
  - [x] cratHighlighterSubpages.pl
  - [ ] cron_shim.sh
  - [x] log rotation
- [x] Install Perl 5.36 and subsequent modules via Perlbrew and cpanm
- [ ] Set up notification emails.  Doesn't work for toolforge-jobs (<https://wikitech.wikimedia.org/wiki/Help:Toolforge/Email#Sending_via_the_command_line>), and since `onfinish` does it no matter what, then maybe consider <https://metacpan.org/dist/Log-Log4perl/view/lib/Log/Log4perl/FAQ.pm> if necessary
- [ ] Fix or alter `$ENV{CRON}` stuff for k8s running, likely not necessary
- [ ] Remove toolforge `$LOGNAME` (`tools.amorybot`) when done with toolforge grid and all running on kubernetes (replacement is... ?)
- [ ] Look into retry
- [ ] Rename cron_shim
- [ ] Reenable read-only stuff?
- [ ] Move botpasswords/secrets to envvars
- [ ] Consider setup_perl.sh for installing modules via system Perl /usr/bin/perl (might mean just running scripts via system Perl?) or even just setup?
- [ ] Look into .kube/config
- <https://k8s-status.toolforge.org/namespaces/tool-amorybot/> and <https://grafana.wmcloud.org/d/TJuKfnt4z/kubernetes-namespace?orgId=1&var-namespace=tool-amorybot&refresh=5s>

## Main module

- Split out main loop somehow
- [x] Split out note creation (note and updateNote) (done but poorly)
- Possible to improve note creation?
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

### Git

- [x] gitOnMain
- [x] gitCleanStatus
- [x] gitSHA

### API - sub module?

- [ ] mwLogin - dieNice, which implies logging as well <https://metacpan.org/dist/Log-Log4perl/view/lib/Log/Log4perl/FAQ.pm#My-new-module-uses-Log4perl-but-what-happens-if-the-calling-program-didn't-configure-it?>
- [ ] dieNice - Ideally would take in self, PR opened.
- [ ] botQuery - Logging?
- [ ] getCurrentGroups Need to remove need for rights from the script, no need for that to be in there
- [ ] getPageGroups

### Local

- [ ] getConfig UGH need to figure out logging, not to mention file versus not <https://metacpan.org/dist/Log-Log4perl/view/lib/Log/Log4perl/FAQ.pm#My-new-module-uses-Log4perl-but-what-happens-if-the-calling-program-didn't-configure-it?>
- [x] findArbComMembers
- [x] findLocalGroupMembers
- [x] processFileData
- [x] cmpJSON
- [x] changeSummary
- [x] oxfordComma
- [x] mapGroups
