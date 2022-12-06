# Todos

## Main module

- Split out main loop somehow
- Split out note creation (note and updateNote)
- Maybe split cmpJSON?  Why?  Figure out JSON::MaybeXS, etc.  Tricky.
- Somehow handle MediaWiki::API stuff, maybe OO?  Ugh
- [x] Split out git stuff into separate module?  Separate script.  But then again, only used there and I don't bother testing it much, so pointless?
- Log::Log4perl stuff only in main script, getConfig, and various API-related things.  Could do that only in separate module?  Stupid?  Definitely stupid.
- Restructure for returns from findArbComMembers, findLocalGroupMembers, etc.; should be simpler
- Consider restructuring around mapGroups and formatting email/note?  Currently awful.
- processFileData isn't testing timestamp, and is too group/user-focused
- Cleanup module pod

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

- [ ] mwLogin - dieNice, which implies logging as well
- [ ] dieNice - Ideally would take in self, PR opened.
- [ ] botShutoffs - Logging
- [ ] getCurrentGroups Need to remove need for rights from the script, no need for that to be in there
- [ ] getPageGroups

### Local

- [ ] getConfig UGH need to figure out logging, not to mention file versus not
- [x] findArbComMembers
- [x] findLocalGroupMembers
- [x] processFileData
- [x] cmpJSON
- [x] changeSummary
- [x] oxfordComma
- [x] mapGroups
