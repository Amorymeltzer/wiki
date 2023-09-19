/*
  CSDCheck, restored from its former glory at [[User:Ale jrb/Scripts/csdcheck.js]] [[Special:PermaLink/295431646]]
  Expanded to work for block, (un)protect, and RevDel menus in addition to delete

  For deletion and blocking, THIS ONLY WORKS if you switch the new ooui menus for the old (better) ones.  Put this in your css:

  .action-delete .oo-ui-dropdownWidget-handle,
  .action-protect .oo-ui-dropdownWidget-handle,
  .mw-special-Block .oo-ui-dropdownWidget-handle,
  .mw-special-Movepage .oo-ui-dropdownWidget-handle,
  .mw-special-Revisiondelete .oo-ui-dropdownWidget-handle,
  .mw-special-AbuseLog .oo-ui-dropdownWidget-handle,
  .mw-special-Contributions .oo-ui-dropdownWidget-handle {
  display: none;
  }

  .action-delete .oo-ui-indicator-down,
  .action-protect .oo-ui-indicator-down,
  .mw-special-Block .oo-ui-indicator-down,
  .mw-special-Movepage .oo-ui-indicator-down,
  .mw-special-Revisiondelete  .oo-ui-indicator-down,
  .mw-special-AbuseLog .oo-ui-indicator-down,
  .mw-special-Contributions .oo-ui-indicator-down {
  display: inline !important;
  }


  Alternatively, put this in your js:
  if ((['delete', 'protect', 'unprotect'].indexOf(mw.config.get('wgAction')) !== -1) || (['Revisiondelete', 'Block', 'AbuseLog'].indexOf(mw.config.get('wgCanonicalSpecialPageName')) !== -1)) {
  mw.util.addCSS(".oo-ui-dropdownWidget-handle {display: none;}");
  mw.util.addCSS(".oo-ui-indicator-down {display: inline !important;}");
  }
*/

$(function () {
	// Clean up the visible text in the dropdown
	// Have to get the element elsewhere because of stupid blockpage
	function cleanList(optionsArray) {
		if (optionsArray === null || optionsArray === undefined) {
			return false;
		}
		var optionsList = optionsArray.options;

		var re = /\[\[([^\]|]*\|)?([^\]]*)\]\]/g; // convert pipe links to their display text.
		for (var i = 0; i < optionsList.length; i++) {
			var option = optionsList[i];
			option.text = option.text.replace(re, '$2');
		}
	}

	if (mw.config.get('wgAction') === 'protect' || mw.config.get('wgAction') === 'unprotect') {
		cleanList(document.getElementsByName('wpProtectReasonSelection')[0]);
	} else if (mw.config.get('wgCanonicalSpecialPageName') === 'Revisiondelete') {
		cleanList(document.getElementsByName('wpRevDeleteReasonList')[0]); // Sigh
	} else if (mw.config.get('wgCanonicalSpecialPageName') === 'Block') {
		cleanList(document.getElementsByName('wpReason')[0]); // Block dropdown is bad and should feel bad
	} else if (mw.config.get('wgCanonicalSpecialPageName') === 'AbuseLog') {
		cleanList(document.getElementsByName('wpdropdownreason')[0]); // OS
	} else if (mw.config.get('wgAction') === 'delete') {
		var delReasonList = document.getElementsByName('wpDeleteReasonList')[0]; // Delete is just as bad now
		cleanList(delReasonList);

		// Blank the reason box and replace with the relevant list item, if applicable
		if (mw.util.getParamValue('wpReason')) {
			// This deletion can be autofilled
			var loc = location.href;
			var reg = /23([a-z0-9]+)/ig;

			var result = reg.exec(loc);
			var options = delReasonList.options;

			for (var i = 0; i < options.length; i++) {
				if (options[i].value.indexOf(result[1]) > -1) {
					delReasonList.selectedIndex = options[i].index;
					document.getElementById('wpReason').value = '';
					break;
				}
			}
		}
	}
});
