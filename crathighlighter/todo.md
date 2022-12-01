# Todos

## Main module

- Split out main loop somehow
- Split out note creation
- Maybe split cmpJSON?  Why?
- Somehow handle MediaWiki::API stuff, maybe OO?  Ugh
- Split out git pull from main check (meaning...?)
- Split out git stuff into separate module?  Separate script.  But then again, only used there and I don't bother testing it much, so pointless?

## Tests

- Text
- Disable?
- Posting?
- Logging?

## All subs?

- [x] gitCheck - Removed!
- [x] gitOnMain
- [x] gitCleanStatus
- [x] gitSHA
- [ ] mwLogin - Logging of course, not to mention dieNice somehow
- [ ] getUserAndPass UGH need to figure out logging, not to mention file versus not
- [ ] dieNice - Works with `shift || $mw`?  Feels risky
- [ ] botShutoffs
- [ ] getCurrentGroups Need to remove need for rights from the script, no need for that to be in there
- [x] findArbComMembers
- [ ] getPageGroups
- [ ] cmpJSON
- [x] changeSummary
- [x] oxfordComma
- [ ] mapGroups Probably will restructure and remove as a sub?
