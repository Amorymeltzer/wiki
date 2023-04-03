# Todos

- [ ] Set up for Kubernetes, consider https://metacpan.org/dist/Log-Log4perl/view/lib/Log/Log4perl/FAQ.pm for email
- System to quickly turn off logging?  Occasionally necessary, e.g. <https://phabricator.wikimedia.org/T333477>

## Main module

- Split out main loop somehow
- Split out note creation (note and updateNote)
- Maybe split cmpJSON?  Why?  Figure out JSON::MaybeXS, etc.  Tricky.
- Somehow handle MediaWiki::API stuff, maybe OO?  Ugh
- [x] Split out git stuff into separate module?  Separate script.  But then again, only used there and I don't bother testing it much, so pointless?
- Log::Log4perl stuff only in main script, getConfig, and various API-related things.  Could do that only in separate module?  Stupid?  Definitely stupid.
- Restructure for returns from findLocalGroupMembers, etc.
- Consider restructuring around mapGroups and formatting email/note?  Currently awful.
- processFileData isn't testing timestamp, and is too group/user-focused
- Cleanup module pod

## Speedups

- [x] findLocalGroupMembers
- [ ] Can I combine the two main queries?  Would require some reworking of the @rights/$groups handling
- [ ] Is it faster to query for `auprop=>'groups'` as I do currently, or is it faster to query for `auprop=>'rights'?  The former might be slower on the server side, but the latter would require going through a lot of different arrays to look for the few that I need...

## Tests

- Text
- Disable?
- Posting?
- Logging?

## All subs

### Git

- [x] gitOnMain
- [x] gitCleanStatus
- [x] gitSHA

### API - sub module?

- [ ] mwLogin - dieNice, which implies logging as well https://metacpan.org/dist/Log-Log4perl/view/lib/Log/Log4perl/FAQ.pm#My-new-module-uses-Log4perl-but-what-happens-if-the-calling-program-didn't-configure-it?
- [ ] dieNice - Ideally would take in self, PR opened.
- [ ] botShutoffs - Logging
- [ ] getCurrentGroups Need to remove need for rights from the script, no need for that to be in there
- [ ] getPageGroups

### Local

- [ ] getConfig UGH need to figure out logging, not to mention file versus not https://metacpan.org/dist/Log-Log4perl/view/lib/Log/Log4perl/FAQ.pm#My-new-module-uses-Log4perl-but-what-happens-if-the-calling-program-didn't-configure-it?
- [x] findArbComMembers
- [x] findLocalGroupMembers
- [x] processFileData
- [x] cmpJSON
- [x] changeSummary
- [x] oxfordComma
- [x] mapGroups
