// Creates a button on [[Special:Log]] that swaps the user log and logs on that user
// Original inspiration from [[User:PleaseStand/common.js]]

$(function() {
	if (mw.config.get('wgCanonicalSpecialPageName') === 'Log') {
		mw.loader.using(['oojs-ui-core', 'oojs-ui-widgets'], function () {
			var rsbutton = new OO.ui.ButtonInputWidget({label: 'Swap roles', useInputTag: true});
			rsbutton.$element.children('input').click(function(event) {
				var $user = $(document.getElementById('mw-input-user').firstChild), $page = $(document.getElementById('mw-input-page').firstChild),
					oldUser = $.trim($user.val()), oldPage = /^user:(.+)$/i.exec($.trim($page.val()));
				$page.val(oldUser ? 'User:' + oldUser : '');
				$user.val(oldPage ? oldPage[1] : '');
				event.preventDefault();
			});
			$('.mw-htmlform-submit-buttons').append(rsbutton.$element);
		});
	}
});
