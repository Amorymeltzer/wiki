# Todos

- [ ] Alert if warnings detected, or something like that.  MediaWiki::API should really have a method for this kind of thing.
- [x] Can `use 5.036` since we know the k8s image guarantees 5.36(.0), so yay `say`
  - [ ] Consider `try/catch`
- [ ] Set up notification emails.  Doesn't work for toolforge-jobs (<https://wikitech.wikimedia.org/wiki/Help:Toolforge/Email#Sending_via_the_command_line>), and since `onfinish` does it no matter what, then maybe consider <https://metacpan.org/dist/Log-Log4perl/view/lib/Log/Log4perl/FAQ.pm#How-can-I-configure-Log::Log4perl-to-send-me-email-if-something-happens?> if necessary.  See also <https://metacpan.org/pod/Email::Simple> and <https://perldoc.perl.org/5.39.4/perlfaq9#How-do-I-send-email?>
- [ ] Maybe also more logging for things like proveMe?  Can rely on filelog, especially if not redirecting output since no emails that way.
- [ ] Consider retry?  Or does it just complicate my set up?
- [ ] Share logging config <https://metacpan.org/dist/Log-Log4perl/view/lib/Log/Log4perl/FAQ.pm#My-new-module-uses-Log4perl-but-what-happens-if-the-calling-program-didn't-configure-it?> etc.

## Main script

- Split out main loop somehow
- [x] Split out note creation (note and updateNote) (done but poorly)
- [ ] Possible to improve note creation?
- [ ] If I completely rework the main loop for each group, the note can just be saved, and can use that for the email/output message?  Would avoid some extraneous stuff (`@localChange`, `@wikiChange`, etc.)
- [ ] Maybe split cmpJSON?  Why?  Figure out JSON::MaybeXS, etc.  Tricky.
- [ ] Somehow handle MediaWiki::API stuff, maybe OO?  Ugh
- [ ] Log::Log4perl stuff only in main script, getConfig, and various API-related things.  Could do that only in separate module?  Stupid?  Definitely stupid.
- [ ] processFileData is too group/user-focused(?)
- [ ] Cleanup module pod
- [ ] Test `File::Slurper` imports, and better check in main script (`-R`, `-W`, `-e`, `-f`, `-s`).  See <https://rt.cpan.org/Public/Bug/Display.html?id=114341> and <https://github.com/Leont/file-slurp-sane/issues/9>

## Speedups

- [ ] Combine the two main queries?  Yes I think so: it would require reworking @rights/$groups handling and all that, but should make things faster since the queries are the only real bottlenecks, plus it's nicer!
  - Basically: Combine into one big query, then split and shunt off to new subroutines.
- [ ] Rework `getCurrentGroups` to just be API stuff, thus pulling out group processing?  Will need an intermediate storage hash, but especially if the page content query is combine (as above) then it would be cleaner, with fewer subs and the like.  Should make testing some stuff easier.  Likewise, connects with some ideals of removing more and more stuff from being connected to the API.
- [ ] Is it faster to query for `auprop=>'groups'` as I do currently, or is it faster to query for `auprop=>'rights'`?  The former might be slower on the server side, but the latter would require going through a lot of different arrays to look for the few that I need...
