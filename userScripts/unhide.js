//Lame kludge to try and show revdel'd things by default
//Force a reload, which is dumb
//[[phab:T218808]]
if (mw.config.get('wgArticleId') && mw.config.get('wgAction') === 'view' && (mw.util.getParamValue('oldid') || mw.util.getParamValue('diff')) && !mw.util.getParamValue('unhide')) {
	if (!mw.config.get('wgRevisionId') || $('.history-deleted').length) {
		window.location.href = window.location.href + '&unhide=1';
	}
}