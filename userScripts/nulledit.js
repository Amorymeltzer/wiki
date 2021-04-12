// From [[User:Splarka/nulledit.js]] and [[User:MZMcBride/nulledit.js]]

function queryString(p) {
	var re = RegExp('[&?]' + p + '=([^&]*)');
	var matches = re.exec(document.location);
	if (matches) {
		try {
			return decodeURI(matches[1]);
		} catch (e) {
			mw.log.warn(e.toString());
			return matches[1];
		}
	}
	return null;
}


$(function () {
	if (mw.config.get('wgNamespaceNumber') !== -1 && mw.config.get('wgArticleId') !== 0) {
		mw.util.addPortletLink(
			'p-tb',
			mw.config.get('wgScript') + '?title=' + encodeURIComponent(mw.config.get('wgPageName')) + '&action=edit&nulledit=true',
			'Null edit',
			't-null',
			'Null edit this page'
		);
	}
});


$(function () {
	if (mw.config.get('wgAction') === 'edit' && queryString('nulledit') === 'true') {
		document.getElementById('wpSave').click();
	}
});
