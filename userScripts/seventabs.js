// Improved version of http://en.wikipedia.org/w/index.php?title=Wikipedia:WikiProject_User_scripts/Scripts/Six_tabs&oldid=166176254
// Optionally add an edit section zero item (0) for a seventh tab
// Shorten tab names
// Enable on certain special pages like WhatLinksHere, Move, etc.
// Work on Modern skin

function sevenTabs() {
	var pCactions = document.getElementById('p-cactions');
	if (!pCactions) {
		return;
	}

	var zeroCool = window.zeroCool === undefined ? true : window.zeroCool;
	var caMain = pCactions.getElementsByTagName('li')[0];
	var caTalk = document.getElementById('ca-talk');
	var caEdit = document.getElementById('ca-edit') || document.getElementById('ca-viewsource');
	var caHistory = document.getElementById('ca-history');
	// if (!caMain || !caTalk || !caEdit || !caHistory) return; // I think some smarter checks below render this unnecessary
	var el_move, el_create, id2;
	if ($(caTalk).hasClass('selected')) { // talk space, defined via class instead of mod to allow for rendering on special pages
		el_move = caTalk; el_create = caMain; id2 = '';
	} else {
		el_move = caMain; el_create = caTalk; id2 = 'discussion';
	}

	if (caHistory !== null) {
		if (zeroCool) {
			// Based on [[User:ais523/editsection0tab.js]] at [[Special:PermaLink/167052430]]
			mw.util.addPortletLink('p-cactions', mw.util.getUrl(mw.config.get('wgRelevantPageName'), { action: 'edit', section: 0 }),
				'0', 'ca-edit-0', 'Edit the lead section of this page', '0',
				$(caTalk).hasClass('selected') ? el_create.nextSibling : el_move.nextSibling);
		}
		caHistory.firstChild.innerHTML = 'hist';
		el_move.parentNode.insertBefore(caHistory, el_move.nextSibling);
	}
	if (caEdit !== null) {
		caEdit.firstChild.innerHTML = caEdit.firstChild.innerHTML.replace(/.*edit.*/gi, 'edit');
		el_move.parentNode.insertBefore(caEdit, el_move.nextSibling);
	}
	caMain.firstChild.innerHTML = caMain.firstChild.innerHTML.replace(' page', '');

	var href = decodeURIComponent(el_create.firstChild.getAttribute('href'));
	href = href.replace(/^\/wiki\//, '');
	if (el_create.className.indexOf('new') < 0) {
		mw.util.addPortletLink('p-cactions', mw.util.getUrl(href, { action: 'history' }), 'hist',
			'ca-history-' + id2, id2 + ' history', '', el_create.nextSibling);
		mw.util.addPortletLink('p-cactions', mw.util.getUrl(href, { action: 'edit' }), 'edit',
			'ca-edit-' + id2, 'Edit ' + id2, '', el_create.nextSibling);
	}

}
// Could also use $('.selected')[0].id != 'ca-nstab-special', I think it amounts to the same thing
if (mw.config.get('wgRelevantPageIsProbablyEditable') === true) {
	$(sevenTabs);
}
