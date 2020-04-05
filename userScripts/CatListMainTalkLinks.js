// Modified from [[User:Equazcion/CatListMainTalkLinks.js]] ([[Special:PermaLink/778892707]])
// Show a history link as well

if (mw.config.get( 'wgNamespaceNumber') === 14) { // Make sure we're in Category space

	// Grab page list elements
	var pages = $("#mw-pages li");

	// Create page var
	var page;

	$.each(pages, function(k, page) {  // Iterate through list elements; each step below runs on each list element

		// Work with the link within each list element from now on
		page = $(page).find('a');

		// Clone the link
		var pageClone = page.clone(true);

		// If the link isn't a talk page, start constructing the talk page link
		if (page.attr('href').indexOf("talk:") == -1 && pageClone.attr('href').indexOf("Talk:") == -1){

			// Set talk page link text
			pageClone.text("talk");

			// Do a dumb replace of the original URL and tooltip
			pageClone.attr('title', pageClone.attr('title').replace("Wikipedia:", "Wikipedia talk:"));
			pageClone.attr('title', pageClone.attr('title').replace("User:", "User talk:"));
			pageClone.attr('title', pageClone.attr('title').replace("Template:", "Template talk:"));
			pageClone.attr('title', pageClone.attr('title').replace("Portal:", "Portal talk:"));
			pageClone.attr('title', pageClone.attr('title').replace("Category:", "Category talk:"));
			pageClone.attr('title', pageClone.attr('title').replace("MediaWiki:", "MediaWiki talk:"));
			pageClone.attr('title', pageClone.attr('title').replace("Help:", "Help talk:"));
			pageClone.attr('title', pageClone.attr('title').replace("Book:", "Book talk:"));
			pageClone.attr('title', pageClone.attr('title').replace("Draft:", "Draft talk:"));
			pageClone.attr('title', pageClone.attr('title').replace("Module:", "Module talk:"));
			pageClone.attr('title', pageClone.attr('title').replace("TimedText:", "TimedText talk:"));
			pageClone.attr('title', pageClone.attr('title').replace("Education Program:", "Education Program talk:"));
			pageClone.attr('href', pageClone.attr('href').replace("Wikipedia:", "Wikipedia talk:"));
			pageClone.attr('href', pageClone.attr('href').replace("User:", "User talk:"));
			pageClone.attr('href', pageClone.attr('href').replace("Template:", "Template talk:"));
			pageClone.attr('href', pageClone.attr('href').replace("Portal:", "Portal talk:"));
			pageClone.attr('href', pageClone.attr('href').replace("Category:", "Category talk:"));
			pageClone.attr('href', pageClone.attr('href').replace("MediaWiki:", "MediaWiki talk:"));
			pageClone.attr('href', pageClone.attr('href').replace("Help:", "Help talk:"));
			pageClone.attr('href', pageClone.attr('href').replace("Book:", "Book talk:"));
			pageClone.attr('href', pageClone.attr('href').replace("Draft:", "Draft talk:"));
			pageClone.attr('href', pageClone.attr('href').replace("Module:", "Module talk:"));
			pageClone.attr('href', pageClone.attr('href').replace("TimedText:", "TimedText talk:"));
			pageClone.attr('href', pageClone.attr('href').replace("Education Program:", "Education Program talk:"));

			// If none of those caught it, it must be an article space link, so add "Talk:" before the page title
			if (pageClone.attr('href').indexOf("talk:") == -1){
				pageClone.attr('title', "Talk:" + pageClone.attr('title'));
				pageClone.attr('href', page.attr('href').replace("wiki/", "wiki/Talk:"));
			}

			// If the link IS a talk page, start constructing the main page link
		} else {

			// Set main page link text
			pageClone.text("main");

			// Do a dumb replace of the original URL and tooltip
			pageClone.attr('title', pageClone.attr('title').replace("Talk:", ""));
			pageClone.attr('title', pageClone.attr('title').replace("Wikipedia talk:", "Wikipedia:"));
			pageClone.attr('title', pageClone.attr('title').replace("User talk:", "User:"));
			pageClone.attr('title', pageClone.attr('title').replace("Template talk:", "Template:"));
			pageClone.attr('title', pageClone.attr('title').replace("Portal talk:", "Portal:"));
			pageClone.attr('title', pageClone.attr('title').replace("Category talk:", "Category:"));
			pageClone.attr('title', pageClone.attr('title').replace("MediaWiki talk:", "MediaWiki:"));
			pageClone.attr('title', pageClone.attr('title').replace("Help talk:", "Help:"));
			pageClone.attr('title', pageClone.attr('title').replace("Book talk:", "Book:"));
			pageClone.attr('title', pageClone.attr('title').replace("Draft talk:", "Draft:"));
			pageClone.attr('title', pageClone.attr('title').replace("Module talk:", "Module:"));
			pageClone.attr('title', pageClone.attr('title').replace("TimedText talk:", "TimedText:"));
			pageClone.attr('title', pageClone.attr('title').replace("Education Program talk:", "Education Program:"));
			pageClone.attr('href', pageClone.attr('href').replace("Talk:", ""));
			pageClone.attr('href', pageClone.attr('href').replace("Wikipedia_talk:", "Wikipedia:"));
			pageClone.attr('href', pageClone.attr('href').replace("User_talk:", "User:"));
			pageClone.attr('href', pageClone.attr('href').replace("Template_talk:", "Template:"));
			pageClone.attr('href', pageClone.attr('href').replace("Portal_talk:", "Portal:"));
			pageClone.attr('href', pageClone.attr('href').replace("Category_talk:", "Category:"));
			pageClone.attr('href', pageClone.attr('href').replace("MediaWiki_talk:", "MediaWiki:"));
			pageClone.attr('href', pageClone.attr('href').replace("Help_talk:", "Help:"));
			pageClone.attr('href', pageClone.attr('href').replace("Book_talk:", "Book:"));
			pageClone.attr('href', pageClone.attr('href').replace("Draft_talk:", "Draft:"));
			pageClone.attr('href', pageClone.attr('href').replace("Module_talk:", "Module:"));
			pageClone.attr('href', pageClone.attr('title').replace("TimedText talk:", "TimedText:"));
			pageClone.attr('href', pageClone.attr('href').replace("Education_Program_talk:", "Education_Program:"));
		}

		// Link is done, just need to check if the target exists so we can turn it red if not.
		// Grab link tooltip (as it now conveniently contains the page title alone, which we need for the Ajax query)
		var cloneTitle = pageClone.attr('title');

		var histLink = $(page).clone(true);
		histLink.text("hist");
		histLink.attr('class', 'plainlinks');
		histLink.attr('href', "/w/index.php?title=" + encodeURI(page.text().replace(/ /g,'_')) + "&action=history");


		// Perform Ajax query (using jQuery's awesomely-simple Ajax function) to get target's "title" data from MediaWiki API
		$.ajax({
			url:mw.util.wikiScript('api') + "?action=query&titles=" + encodeURIComponent(cloneTitle) + "&format=xml",
			dataType: "xml",
			type: "GET",
			success:parseIt
		});

		// If Ajax result shows the target doesn't exist, add "new" class to the link to turn it red
		function parseIt (xml){
			var missing = $(xml).find('page').attr('missing');              // Grab the "missing" attribute from the "page" xml tag that's included in "title" data
			if (typeof missing != "undefined") pageClone.addClass('new');   // The "missing" field is only defined (as empty string) in the API when the page doesn't exist,
		}                                                                   // ...so if "missing" is NOT undefined, the target IS missing. Turn the link red.

		// Insert the constructed link after the existing one, along with space and parenthesis
		pageClone.insertAfter(page).before("| ").after(")");
		histLink.insertAfter(page).before(" (").after(" ");

	});

}
