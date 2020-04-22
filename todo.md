### Todo List
#### Wikispecies
* Figure out redirects (esp. those to "sect.")
* Investigate linking and output (pdf?  wikitext?  pdfroff and wkhtmltopdf should work but options awkward)
* More automated/better instructions
* Cleanup, rerun, maybe publish?

#### S-index
* Consider putting annual back to year, not mon year
    * Or fixed at end not start?  Not clear either way
* Quick way to update graphs on commons?
* Change fonts?
* Justify title and legend left?  Gets complicated...
* Figure out a way to identify nonsysops that get logs from moves/overwriting
* Option to specify start date?  Don't pass to getDates, but to calcH/sysopH
* Check out fable for prediction?
* Use MediaWiki::API for uploading?

##### Possible additions
* S-index for just delete/protect/block totals?
    * Or S-index for each individual action family? (d/b/p-index)
    * Leaves out import and rights only
        * Minor issue, likely, but could be interesting
* Include number of sysops, number of active sysops, etc.?
* o-index (geometric mean of h-index and most-cited paper)

#### userScripts
* Something to process updates to others' that I've modified (maybe parse the first line)
##### updateModernjs.pl
* Get server, allow for updating foreign pages (will need to restructure to grab servers first, then iterate log in/(log out?))
##### seventabs
* Fixes for Vector, see https://en.wikipedia.org/wiki/User:Js/6tabs-vector.js
* Timeless?
* Fix spacing for Monobook

#### cratHighlighter
* Log if wiki/file changes but not made since not -p/-c
* TF
