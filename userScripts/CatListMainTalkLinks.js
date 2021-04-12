// Modified from [[User:Equazcion/CatListMainTalkLinks.js]] ([[Special:PermaLink/778892707]])
// Show a history link as well

if (mw.config.get('wgNamespaceNumber') === 14) { // Make sure we're in Category space
	// Grab page list elements
	var pages = $('#mw-pages li');
	$.each(pages, function(k, page) {
		// Work with the link within each list element from now on
		page = $(page).find('a');

		// Clone the link
		var pageClone = page.clone(true);

		// If the link isn't a talk page, start constructing the talk page link
		if (page.attr('href').indexOf('talk:') === -1 && pageClone.attr('href').indexOf('Talk:') === -1) {
			pageClone.text('talk');
			var t = mw.Title.newFromText(pageClone.attr('title'));
			if (t) {
				t.getTalkPage();
				pageClone.attr('title', t.getPrefixedText());
				pageClone.attr('href', '/wiki/' + t.getPrefixedDb());
			}
		} else { // If the link IS a talk page, start constructing the main page link
			pageClone.text('main');
			var m = mw.Title.newFromText(pageClone.attr('title'));
			if (m) {
				m.getSubjectPage();
				pageClone.attr('title', m.getPrefixedText());
				pageClone.attr('href', '/wiki/' + m.getPrefixedDb());
			}
		}

		// Link is done, just need to check if the target exists so we can turn it red if not.
		// Grab link tooltip (as it now conveniently contains the page title alone, which we need for the Ajax query)
		var cloneTitle = pageClone.attr('title');

		var histLink = $(page).clone(true);
		histLink.text('hist');
		histLink.attr('class', 'plainlinks');
		histLink.attr('href', '/w/index.php?title=' + encodeURI(page.text().replace(/ /g, '_')) + '&action=history');

		// Get target's "title" data from MediaWiki API
		$.ajax({
			url: mw.util.wikiScript('api') + '?action=query&titles=' + encodeURIComponent(cloneTitle) + '&format=xml',
			dataType: 'xml',
			type: 'GET',
			success: parseIt
		});

		// If Ajax result shows the target doesn't exist, add "new" class to the link to turn it red
		function parseIt (xml) {
			var missing = $(xml).find('page').attr('missing');
			if (typeof missing !== 'undefined') {
				pageClone.addClass('new');
			}
		}

		// Insert the constructed link after the existing one, along with space and parenthesis
		pageClone.insertAfter(page).before('| ').after(')');
		histLink.insertAfter(page).before(' (').after(' ');

	});

}
