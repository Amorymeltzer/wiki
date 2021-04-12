if (mw.config.get('wgCanonicalSpecialPageName') === 'Contributions' && !mw.config.exists('wgRelevantUserName')) {
	var $ip = $('input[name=target]');
	if ($ip.length && $ip.val() && mw.util.isIPAddress($ip.val(), true)) {
		mw.config.set('wgRelevantUserName', $ip.val());
	}
} else if (mw.config.get('wgPageName') === 'User:Amorymeltzer/Wikipedia:Requests_for_page_protection') {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/qrfpp.js/test.js&action=raw&ctype=text/javascript');
}

mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/unhide.js&action=raw&ctype=text/javascript');
