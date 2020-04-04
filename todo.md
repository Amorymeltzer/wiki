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

##### Possible additions
* S-index for just delete/protect/block totals?
    * Or S-index for each individual action family? (d/b/p-index)
    * Leaves out import and rights only
        * Minor issue, likely, but could be interesting
* Include number of sysops, number of active sysops, etc.?
* o-index (geometric mean of h-index and most-cited paper)

#### cratHighlighter
* Combine loops
* Use JSON for more stuff?
* Can use objects (after JSON->decode) to compare which direction?
    * Could in theory mean not needing the .wiki files...
	* Basically, read file to json->decode to hash
	* Same for query and on-wiki
	* Iterate over one, delete if found in other;  Then iterate over other:
	* file not query = remove from file
	* query not file = add to file
	* wiki not query = remove from wiki
	* query not wiki = add to wiki

#### userScripts
* Something to process updates to others' that I've modified (maybe parse the first line)
##### updateModernjs.pl
* Get server, allow for updating foreign pages (will need to restructure to grab servers first, then iterate log in/(log out?))
