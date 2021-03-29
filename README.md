# Various WMF-related stuff

Often perl, potentially frivolous

## enWiki

### [`crathighlighter`](./crathighlighter/)

Easily update json subpages (under [User:AmoryBot](https://en.wikipedia.org/wiki/User:AmoryBot)) for [User:Amorymeltzer/crathighlighter](https://en.wikipedia.org/wiki/User:Amorymeltzer/crathighlighter).  The script ([`toolforgeHighlighter.pl`](./crathighlighter/toolforgeHighlighter.pl)) is run regularly on [Toolforge](https://wikitech.wikimedia.org/wiki/Portal:Toolforge).

### [`sysopIndex`](./sysopIndex/)

Creates an *h*-index-like metric for sysops, and includes some pretty graphs via R; see [User:Amorymeltzer/s-index](https://en.wikipedia.org/wiki/User:Amorymeltzer/s-index) for results.  Full instructions are available in the [README](./sysopIndex/README.md), but mainly uses a single shim, [sIndex.sh](./sysopIndex/sIndex.sh).

### [`userScripts`](./userScripts/)

My on-wiki userscripts and custom JavaScript/CSS.  Easier to edit them locally, plus there are a few scripts to make updating things easier:

- [`push.pl`](./userScripts/push.pl): Pushes new versions live to my userspace, based on Twinkle's sync.pl
- [`updateModernjs.pl`](./userScripts/updateModernjs.pl): For safety reasons, I only import specific revisions of user scripts.  This script checks those pages for any new updates, then shows me the diffs so I can review them for safety, then updates my js file.

### [`twinkle`](./twinkle/)

Stuff for [Twinkle](https://github.com/azatoth/twinkle) (WP:TW)

#### [`twinkleCheck`](./twinkle/twinkleCheck.pl)

Quickly check which [Twinkle](https://github.com/azatoth/twinkle/) files need updating on-wiki.  Works on enwiki or testwiki, and can show diffs.  Rough.

#### [`tagCleanup`](./twinkle/tagCleanup/)

Some stuff for <https://github.com/azatoth/twinkle/issues/178> and <https://github.com/azatoth/twinkle/pull/840>

#### [`warningComments`](./twinkle/warningComments/)

Some stuff for <https://github.com/azatoth/twinkle/issues/922>

## [Wikispecies](./wikispecies/)

### Species-Genus list

Create a list of identical *Genus-species* pairs from WikiSpecies.  Simply download the latest Wikispecies "all titles from mainspace" [dump](http://dumps.wikimedia.org/backup-index.html), then run [`speciesGenusList`](./wikispecies/speciesGenusList.pl).  In theory, [`makeWikiSpeciesLinks`](./wikispecies/makeWikiSpeciesLinks.pl) should make some links or pretty documents, but doesn't.

- Code licensed under the [WTFPL](http://www.wtfpl.net/)
- Images licensed under [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
