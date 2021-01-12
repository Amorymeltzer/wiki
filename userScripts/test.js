if (mw.config.get('wgCanonicalSpecialPageName') === 'Contributions' && !mw.config.exists('wgRelevantUserName')) {
    var $ip = $('input[name=target]');
    if ($ip.length && $ip.val() && mw.util.isIPAddress($ip.val(), true)) {
	mw.config.set('wgRelevantUserName', $ip.val());
    }
} else if (mw.config.get('wgPageName') == 'User:Amorymeltzer/Wikipedia:Requests_for_page_protection') {
    importScript('User:Amorymeltzer/qrfpp.js/test.js');
}

importScript('User:Amorymeltzer/unhide.js');
