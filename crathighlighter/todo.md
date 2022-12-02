# Todos

## Main module

- Split out main loop somehow
- Split out note creation
- Maybe split cmpJSON?  Why?  Figure out JSON::MaybeXS, etc
- Somehow handle MediaWiki::API stuff, maybe OO?  Ugh
- Split out git pull from main check (meaning...?)
- Split out git stuff into separate module?  Separate script.  But then again, only used there and I don't bother testing it much, so pointless?
- Log::Log4perl stuff only in main script, getConfig, and various API-related things.  Could do that only in separate module?  Stupid.
- Restructure for returns from findArbComMembers, findLocalGroupMembers, etc.; should be simpler
- Consider restructuring around mapGroups and formatting email/note?  Currently shit.

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

- [ ] mwLogin - Logging of course, not to mention dieNice somehow
- [ ] dieNice - Works with `shift || $mw`?  Feels risky
- [ ] botShutoffs - Logging
- [ ] getCurrentGroups Need to remove need for rights from the script, no need for that to be in there
- [ ] getPageGroups

### Local

- [ ] getConfig UGH need to figure out logging, not to mention file versus not
- [x] findArbComMembers
- [x] findLocalGroupMembers
- [x] processFileData
- [ ] cmpJSON - Figure out JSON stuff, maybe split?  Tricky.
- [x] changeSummary
- [x] oxfordComma
- [x] mapGroups
