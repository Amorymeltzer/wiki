// Overflow of most of the functions here inspired by [[User:Equazcion/CatListMainTalkLinks.js]]

// Quick delete and cleanup functions
$(function () {
	if ((mw.util.getParamValue('geight') === 'yes') || (mw.util.getParamValue('gthirteen') === 'yes')) {
		var gSumm;
		var gName;
		var gWhich;
		if (mw.util.getParamValue('geight') === 'yes') {
			gSumm = '[[WP:CSD#G8|G8]]: Dependent on a nonexistant page';
			gName = 'G8';
			gWhich = 'geight';
		} else if (mw.util.getParamValue('gthirteen') === 'yes') {
			gSumm = '[[WP:CSD#G13|G13]]: Abandoned [[WP:AFC|Article for creation]] — to retrieve it, see [[WP:REFUND/G13]]';
			gName = 'G13';
			gWhich = 'gthirteen';
		}

		if (mw.config.get('wgAction') === 'delete') {
			document.getElementById('wpReason').value = gSumm;
			document.getElementById('deleteconfirm').submit();
		} else if (mw.config.get('wgAction') === 'view') {
			mw.util.addPortletLink('p-cactions', '//en.wikipedia.org/wiki/' + mw.config.get('wgPageName') + '?action=delete&' + gWhich + '=yes', gName, gName, 'Delete under CSD ' + gName);
		}

	} else if (mw.util.getParamValue('magicword') === 'yes' && mw.config.get('wgAction') === 'edit') {
		var txt = document.editform.wpTextbox1;
		txt.value = txt.value.replace(/{{basepagename[:|]/gi, '{{BASEPAGENAME:');
		txt.value = txt.value.replace(/{{defaultsort[:|]/gi, '{{DEFAULTSORT:');
		txt.value = txt.value.replace(/{{display ?title[:|]/gi, '{{DISPLAYTITLE:');
		txt.value = txt.value.replace(/{{fullpagename[:|]/gi, '{{FULLPAGENAME:');
		txt.value = txt.value.replace(/{{namespace[:|]/gi, '{{NAMESPACE:');
		txt.value = txt.value.replace(/{{numberofarticles[:|]/gi, '{{NUMBEROFARTICLES:');
		txt.value = txt.value.replace(/{{padleft[:|]/gi, '{{PADLEFT:');
		txt.value = txt.value.replace(/{{pagename[:|]/gi, '{{PAGENAME:');
		txt.value = txt.value.replace(/{{protectionlevel[:|]/gi, '{{PROTECTIONLEVEL:');
		txt.value = txt.value.replace(/{{pagesize[:|]/gi, '{{PAGESIZE:');
		txt.value = txt.value.replace(/{{shortdesc[:|]/gi, '{{SHORTDESC:');
		txt.value = txt.value.replace(/{{subpagename[:|]/gi, '{{SUBPAGENAME:');

		document.editform.wpSummary.value = 'Use magic word in place of template';
		document.getElementById('wpMinoredit').checked = true;
		document.getElementById('wpWatchthis').checked = false;

		document.getElementById('wpDiff').click();
	} else if (mw.util.getParamValue('copyrev') === 'yes' && mw.config.get('wgAction') === 'edit') {
		var ctxt = document.editform.wpTextbox1;
		ctxt.value = ctxt.value.replace(/\{\{(copy(vio|right)-)?(revdel|histpurge)(-copyvio)?(\n?\|.*)*\n?}}\n?/i, '');

		document.editform.wpSummary.value = 'Revision delete done, removing copyvio template';
		document.getElementById('wpMinoredit').checked = false;
		document.getElementById('wpWatchthis').checked = true;
	}
});


// Page-specific functions
// Make clearing [[Wikipedia:Database reports/Orphaned talk pages]] easier
if (mw.config.get('wgPageName') === 'Wikipedia:Database_reports/Orphaned_talk_pages') {
	// Grab page list elements
	var orPages = $('.wikitable a');

	$.each(orPages, function(k, page) {  // Iterate through list elements; each step below runs on each list element

		// Work with the link within each list element from now on
		page = $(page);

		// Clone the link
		var pageClone = page.clone(true);

		// Fix for redirects
		if (pageClone.attr('class') === 'external text') {
			pageClone.attr('href', pageClone.attr('href').replace(/.*=(.*_?)([Tt]alk)(.*)&redirect=no/gi, '/wiki/$1$2$3'));
			pageClone.attr('title', pageClone.attr('href').replace(/\/wiki\//gi, ''));
		}

		// Save talk title
		var talkTitle = pageClone.attr('title');
		//   talkTitle = encodeURIComponent(talkTitle);

		// Set main page link text
		pageClone.text('main');

		// Do a dumb replace of the original URL and tooltip
		pageClone.attr('title', pageClone.attr('title').replace('Talk:', ''));
		pageClone.attr('title', pageClone.attr('title').replace('Wikipedia talk:', 'Wikipedia:'));
		pageClone.attr('title', pageClone.attr('title').replace('User talk:', 'User:'));
		pageClone.attr('title', pageClone.attr('title').replace('Template talk:', 'Template:'));
		pageClone.attr('title', pageClone.attr('title').replace('Portal talk:', 'Portal:'));
		pageClone.attr('title', pageClone.attr('title').replace('Category talk:', 'Category:'));
		pageClone.attr('title', pageClone.attr('title').replace('MediaWiki talk:', 'MediaWiki:'));
		pageClone.attr('title', pageClone.attr('title').replace('Help talk:', 'Help:'));
		pageClone.attr('title', pageClone.attr('title').replace('Book talk:', 'Book:'));
		pageClone.attr('title', pageClone.attr('title').replace('Draft talk:', 'Draft:'));
		pageClone.attr('title', pageClone.attr('title').replace('Module talk:', 'Module:'));
		pageClone.attr('title', pageClone.attr('title').replace('TimedText talk:', 'TimedText:'));
		pageClone.attr('title', pageClone.attr('title').replace('Education Program talk:', 'Education Program:'));
		pageClone.attr('href', pageClone.attr('href').replace('Talk:', ''));
		pageClone.attr('href', pageClone.attr('href').replace('Wikipedia_talk:', 'Wikipedia:'));
		pageClone.attr('href', pageClone.attr('href').replace('User_talk:', 'User:'));
		pageClone.attr('href', pageClone.attr('href').replace('Template_talk:', 'Template:'));
		pageClone.attr('href', pageClone.attr('href').replace('Portal_talk:', 'Portal:'));
		pageClone.attr('href', pageClone.attr('href').replace('Category_talk:', 'Category:'));
		pageClone.attr('href', pageClone.attr('href').replace('MediaWiki_talk:', 'MediaWiki:'));
		pageClone.attr('href', pageClone.attr('href').replace('Help_talk:', 'Help:'));
		pageClone.attr('href', pageClone.attr('href').replace('Book_talk:', 'Book:'));
		pageClone.attr('href', pageClone.attr('href').replace('Draft_talk:', 'Draft:'));
		pageClone.attr('href', pageClone.attr('href').replace('Module_talk:', 'Module:'));
		pageClone.attr('href', pageClone.attr('href').replace('TimedText_talk:', 'TimedText:'));
		pageClone.attr('href', pageClone.attr('href').replace('Education_Program_talk:', 'Education_Program:'));

		// Remove database report link
		pageClone.attr('href', pageClone.attr('href').replace(' (page does not exist)', ''));
		pageClone.attr('title', pageClone.attr('title').replace(' (page does not exist)', ''));

		// Link is done, just need to check if the target exists so we can turn it red if not.
		// Grab link tooltip (as it now conveniently contains the page title alone, which we need for the Ajax query)
		var cloneTitle = pageClone.attr('title');
		cloneTitle = encodeURIComponent(cloneTitle);

		// Perform Ajax query (using jQuery's awesomely-simple Ajax function) to get target's "title" data from MediaWiki API
		$.ajax({
			url: mw.util.wikiScript('api') + '?action=query&titles=' + cloneTitle + '&format=xml',
			dataType: 'xml',
			type: 'GET',
			success: parseIt
		});

		var logLink = $(pageClone).clone(true);
		logLink.text('log');
		logLink.attr('class', 'external text');
		logLink.attr('href', '/w/index.php?title=Special:Log&page=' + cloneTitle);

		var histLink = $(page).clone(true);
		histLink.text('hist');
		histLink.attr('class', 'external text');
		histLink.attr('href', '/w/index.php?title=' + encodeURIComponent(talkTitle) + '&action=history');

		var delLink = $(page).clone(true);
		delLink.text('G8');
		// Try with API
		var api = new mw.Api();
		delLink.attr('href', '#');

		$(delLink).on('click', function() {
			geight(talkTitle);
			return false;
		});

		function geight(page_title) {
			api.postWithEditToken({
				action: 'delete',
				reason: '[[WP:CSD#G8|G8]]: Dependent on a nonexistant page',
				title: page_title
			});
		}
		// If Ajax result shows the target doesn't exist, add "new" class to the link to turn it red
		function parseIt (xml) {
			var missing = $(xml).find('page').attr('missing');              // Grab the "missing" attribute from the "page" xml tag that's included in "title" data
			if (typeof missing !== 'undefined') {
				pageClone.addClass('new');
			}   // The "missing" field is only defined (as empty string) in the API when the page doesn't exist,
		}                                                                   // ...so if "missing" is NOT undefined, the target IS missing. Turn the link red.

		if (pageClone.attr('class') === 'external text') {
			page.attr('href', page.attr('href') + '&geight=yes');
		} else {
			page.attr('href', page.attr('href') + '?geight=yes');
		}
		// Insert the constructed link after the existing one, along with space and parenthesis
		delLink.insertAfter(page).before('| ').after(')');
		logLink.insertAfter(page).before('| ').after(' ');
		pageClone.insertAfter(page).before('| ').after(' ');
		histLink.insertAfter(page).before(' (').after(' ');

	});

} else if (mw.config.get('wgCanonicalSpecialPageName') === 'BrokenRedirects') {
	// Make cleaning [[Special:BrokenRedirects]] easier

	// Grab page list elements
	var brPages = $('.special li');

	$.each(brPages, function(k, page) {  // Iterate through list elements; each step below runs on each list element

		var mLink = $(page).find('a')[0];
		var delLink = $(mLink).clone(true);
		delLink.text('G8');
		// Try with API
		var api = new mw.Api();
		delLink.attr('href', '#');

		var histLink = $(mLink).clone(true);
		histLink.text('hist');
		histLink.attr('class', 'external text');
		histLink.attr('href', '/w/index.php?title=' + encodeURIComponent(mLink.text) + '&action=history');


		$(delLink).on('click', function() {
			geight(mLink.text);
			return false;
		});

		function geight(page_title) {
			api.postWithEditToken({
				action: 'delete',
				reason: '[[WP:CSD#G8|G8]]: Dependent on a nonexistant page',
				title: page_title
			});
		}

		// Work with the link within each list element from now on
		mLink.href += '?geight=yes'; // The main link
		page = $(page).find('a')[2]; // The delete link
		if (page) {
			page.href += '&geight=yes';
		}

		histLink.insertBefore(page).before('').after(' | ');
		delLink.insertAfter(page).before(' | ').after('');
	});
} else if (mw.config.get('wgPageName') === 'User:AnomieBOT_III/Broken_redirects') {
	// Make cleaning [[User:AnomieBOT III/Broken redirects]] easier

	// Grab page list elements
	var abPages = $('.plainlinks a');

	$.each(abPages, function(k, page) {  // Iterate through list elements; each step below runs on each list element

		page = $(page);

		var delLink = page.clone(true);
		delLink.text('G8');
		// Try with API
		var api = new mw.Api();
		delLink.attr('href', '#');

		var histLink = page.clone(true);
		histLink.text('hist');
		histLink.attr('class', 'external text');
		histLink.attr('href', '/w/index.php?title=' + encodeURIComponent(page.text()) + '&action=history');


		$(delLink).on('click', function() {
			geight(page.text());
			return false;
		});

		function geight(page_title) {
			api.postWithEditToken({
				action: 'delete',
				reason: '[[WP:CSD#G8|G8]]: Dependent on a nonexistant page',
				title: page_title
			});
		}

		// Work with the link within each list element from now on
		page.attr('href', page.attr('href') + '?geight=yes'); // The main link

		delLink.insertAfter(page).before('| ').after(')');
		histLink.insertAfter(page).before(' (').after(' ');
	});
} else if (mw.config.get('wgPageName') === 'Category:Pages_which_use_a_template_in_place_of_a_magic_word') {
	// Make fixing [[:Category:Pages which use a template in place of a magic word]] easier

	// Grab page list elements
	var maPages = $('#mw-pages li');

	$.each(maPages, function(k, page) {  // Iterate through list elements; each step below runs on each list element
		// Work with the link within each list element from now on
		page = $(page).find('a')[0];
		page.href += '?action=edit&magicword=yes';
	});
} else if (mw.config.get('wgPageName') === 'Category:Candidates_for_speedy_deletion_as_abandoned_drafts_or_AfC_submissions') {
	// Make cleaning [[:Category:Candidates_for_speedy_deletion_as_abandoned_drafts_or_AfC_submissions]] easier

	// Grab page list elements
	var drPages = $('#mw-pages li');

	$.each(drPages, function(k, page) {  // Iterate through list elements; each step below runs on each list element
		// Work with the link within each list element from now on
		page = $(page).find('a')[0];
		page.href += '?gthirteen=yes';
	});
} else if (mw.config.get('wgPageName') === 'Wikipedia:Database_reports/Stale_drafts') {
	// Make tidying [[:Wikipedia:Database_reports/Stale_drafts]] easier

	// Grab page list elements
	var stPages = $('.wikitable tr');

	$.each(stPages, function(k, page) {  // Iterate through list elements; each step below runs on each list element

		page = $(page.firstElementChild.firstElementChild);
		if (typeof page === 'undefined') {
			return true;
		}

		var delLink = page.clone(true);
		delLink.text('G13');
		// Try with API
		var api = new mw.Api();
		delLink.attr('href', '#');

		var histLink = page.clone(true);
		histLink.text('hist');
		histLink.attr('class', 'external text');
		histLink.attr('href', '/w/index.php?title=' + encodeURIComponent(page.text()) + '&action=history');


		$(delLink).on('click', function() {
			gthirteen(page.text());
			return false;
		});

		function gthirteen(page_title) {
			api.postWithEditToken({
				action: 'delete',
				reason: '[[WP:CSD#G13|G13]]: Abandoned [[WP:AFC|Article for creation]] — to retrieve it, see [[WP:REFUND/G13]]',
				title: page_title
			});
		}

		// Work with the link within each list element from now on
		page.attr('href', page.attr('href') + '?gthirteen=yes'); // The main link

		delLink.insertAfter(page).before('| ').after(')');
		histLink.insertAfter(page).before(' (').after(' ');
	});
} else if (mw.config.get('wgCanonicalSpecialPageName') === 'Undelete') {
	// Make processing page creation logs easier

	// Grab page list elements
	var unPages = $('.mw-usertoollinks');

	$.each(unPages, function(k, page) {  // Iterate through list elements; each step below runs on each list element

		page = page.getElementsByTagName('a');
		page = $(page);
		var mLink = page[page.length - 1];
		var user = mLink.title.replace(/Special:Block\//, '');
		var histLink = $(mLink).clone(true);
		histLink.text('log');
		histLink.attr('class', 'external text');
		histLink.attr('href', '/w/index.php?title=Special:Log&user=' + user);

		histLink.insertBefore(page[2]).before('').after(' | ');
	});
} else if (mw.config.get('wgPageName') === 'Category:Requested_RD1_redactions') {
	// Make processing [[:Category:Requested_RD1_redactions]] easier

	// Grab page list elements
	var rdPages = $('#mw-pages li');

	$.each(rdPages, function(k, page) {  // Iterate through list elements; each step below runs on each list element
		// Work with the link within each list element from now on
		page = $(page).find('a')[0];
		page.href += '?copyrev=yes&action=edit&section=0';
	});
}
