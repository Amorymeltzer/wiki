// Inspired by [[User:Smith609/toolbox.js]] ([[Special:Diff/281341033]])
// Various tools to provide information on the given page
// See also [[User:Amorymeltzer/pedit.js]]

if (mw.config.get('wgRelevantPageIsProbablyEditable') || mw.config.exists('wgRelevantUserName')) {
	$(function () {
		var pTb = document.getElementById('p-tb');
		var pInfo = pTb.cloneNode(true);

		pInfo.id = 'p-info';
		pInfo.innerHTML = '<h3>Info</h3><div class=pBody><ul></ul></div>';
		pTb.parentNode.insertBefore(pInfo, pTb.nextSibling);

		// wgRelevantPageName doesn't discriminate via namespace, so check editability rather than doing relPage.match(/^Special:/) or something
		// Basically means no special pages unless there's an associated page (e.g. on WhatLinksHere or RecentChangesLinked)
		var relPage = mw.util.wikiUrlencode(mw.config.get('wgRelevantPageName'));// Fix for characters like +
		if (mw.config.get('wgRelevantPageIsProbablyEditable')) {
			mw.util.addPortletLink('p-info', '//en.wikipedia.org/w/index.php?title=Special:Log&page=' + relPage, 'Page logs', 'pt-logs', 'Logs of this page');
			mw.util.addPortletLink('p-info', '//en.wikipedia.org/wiki/Special:PrefixIndex/' + relPage + '/', 'Subpages', 'pt-subpages', 'All subpages of this page');
		}

		// Restrict to user-related pages
		var userName = mw.config.get('wgRelevantUserName');
		if (userName) {
			mw.util.addPortletLink('p-info', '//en.wikipedia.org/wiki/Special:PrefixIndex/User:' + userName + '/', 'User space', 'pt-usersubpage', 'All subpages of this user');
			mw.util.addPortletLink('p-info', 'https://xtools.wmflabs.org/ec/en.wikipedia.org/' + userName, 'Edit count', 'pt-usereditcount', 'Edit count');
			mw.util.addPortletLink('p-info', '//en.wikipedia.org/w/index.php?title=Special:Log&type=block&page=User:' + userName, 'Block log', 'pt-userblocklog', 'Block log for this user');
		}

		if (mw.config.get('wgRelevantPageIsProbablyEditable')) {
			mw.util.addPortletLink('p-info', 'http://wikipedia.ramselehof.de/wikiblame.php?lang=en&article=' + relPage, 'WikiBlame', 'pt-wikiblame', 'Search revisions for added text');
			mw.util.addPortletLink('p-info', 'https://xtools.wmflabs.org/articleinfo/en.wikipedia.org/' + relPage, 'History stats', 'pt-editstats', 'Page edit history stats');
			mw.util.addPortletLink('p-info', 'https://tools.wmflabs.org/pageviews/?project=en.wikipedia.org&platform=all-access&agent=user&range=latest-90&pages=' + relPage, 'Pageviews', 'pt-views', 'Traffic to this page');
		}

		// Restrict to mainspace
		if (mw.config.get('wgNamespaceNumber') === '0' || mw.config.get('wgNamespaceNumber') === '1') {
			mw.util.addPortletLink('p-info', 'https://tools.wmflabs.org/sigma/usersearch.py?server=enwiki&page=' + mw.config.get('wgTitle'), 'Edits by user', 'pt-editsbyuser', 'Edits by user');
		}
	});
}
