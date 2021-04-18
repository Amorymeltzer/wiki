# Todo List

## Wikispecies

- Figure out redirects (esp. those to "sect.")
- Investigate linking and output (pdf?  wikitext?  pdfroff and wkhtmltopdf should work but options awkward)
- More automated/better instructions
- Cleanup, rerun, maybe publish?

## S-index

- Consider putting annual back to year, not mon year
  - Or fixed at end not start?  Not clear either way
- Quick way to update graphs on commons?
- Change fonts?
- Justify title and legend left?  Gets complicated...
- Figure out a way to identify nonsysops that get logs from moves/overwriting
- Option to specify start date?  Don't pass to getDates, but to calcH/sysopH
- Check out fable for prediction?
- Use MediaWiki::API for uploading?

### Possible additions

- S-index for just delete/protect/block totals?
  - Or S-index for each individual action family? (d/b/p-index)
  - Leaves out import and rights only
    - Minor issue, likely, but could be interesting
- Include number of sysops, number of active sysops, etc.?
- o-index (geometric mean of h-index and most-cited paper)

## crathighlighter

- Consider redoing logger with an appender so as to make use of `Log::Dispatch::FileRotate` (via `Log::Log4perl::JavaMap::RollingFileAppender`)

## userScripts

### updateModernjs.pl

- Fix for non-ascii characters
- Log out?
- Show user and edit summary for multiple edits?

### seventabs

- Fixes for Vector, see <https://en.wikipedia.org/wiki/User:Js/6tabs-vector.js>
- Timeless?
- Fix spacing for Monobook
