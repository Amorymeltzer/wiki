##Basic layout for script to check modern

- take text of modern.js, pull all mw.loader.loads with oldid (bash or perl)
- For each:
- get url to &action= (regex)
- get bit between ?title= and &oldid= (regex)
- get bit between &oldid= and &action= (regex)
- Then query url&title and get latest revid, content, timestamp? (perl fo sho)
- If oldid != latest revid, also query oldid (else next) (perl, obvi)
- Compare diff of two (ideally would want icdiff, so bash would be nice, but maybe system?)
- prompt for confirm Y (replace) or N (next)

- Use bash shim:
- Grep the url to action, hand off title and oldid to perl
- Perl get content, old content, print files
- Send titles and oldids to bash
- https://stackoverflow.com/q/1494178/2521092
- icdiff content, confirm
- perl one liner to replace each


- NAH use perl:
- Snag urls (perl via IPC::Open3)
- Get page, compare latest rev id
- If same, skip.  If different, query oldid for content
- Put everything in hash of hashs of arrays
- icdiff content to confirm (bash one liner (IPC::Open3?) to generate content a la flashcards.pl)
- confirm Y or N
- one liner (bash/perl) to replace ID




## Example content

'user' => 'Amorymeltzer',
'ns' => 2,
'size' => 39913,
'title' => 'User:Amorymeltzer/modern.js',
'comment' => 'Update a few scripts to their latest revisions',
'revid' => 922527763,
'contentformat' => 'text/javascript',
'parentid' => 921860823,
'*' => "/*jshint maxerr:999*/
			....",
'timestamp' => '2019-10-22T17:58:04Z',
'pageid' => 38837488,
'minor' => '',
'contentmodel' => 'javascript'
