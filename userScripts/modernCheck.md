##Basic layout for script to check modern

- take text of modern.js, pull all mw.loader.loads with oldid (bash or perl)
- For each:
- get url to &action= (regex)
- get bit between ?title= and &oldid= (regex)
- get bit between &oldid= and &action= (regex)
- Then query url&title and get latest revid, content, timestamp (perl fo sho)
- If oldid != latest revid, also query oldid (else next) (perl, obvi)
- Compare diff of two (ideally would want icdiff, so bash would be nice, but maybe system?)
- prompt for confirm Y (replace) or N (next)





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
