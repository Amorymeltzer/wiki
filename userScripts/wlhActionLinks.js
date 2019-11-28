//Modified version of [[meta:User:He7d3r/Tools/AddActionLinks.js]]
//https://meta.wikimedia.org/w/index.php?title=User:He7d3r/Tools/AddActionLinks.js&oldid=12463106
//Only on [[Special:WhatLinksHere]], made English, removed edit link, swapped hist and delete
//Do things more Amory-esque, i.e. worse

if (mw.config.get('wgCanonicalSpecialPageName') === "Whatlinkshere") {
    var items = $("#mw-whatlinkshere-list li");
	$.each(items, function(k, item) {
	    var itemz = $(item).find('a')[0];

	    var histLink = $(itemz).clone(true);
	    histLink.text("hist");
	    histLink.attr('href', "/w/index.php?title=" + encodeURI(itemz.title) + "&action=history");

	    if ($.inArray('sysop', mw.config.get('wgUserGroups')) !== -1) {
		var delLink = $(itemz).clone(true);
		delLink.text("del");
		delLink.attr('href', "/w/index.php?title=" + encodeURI(itemz.title) + "&action=delete");

		delLink.insertAfter($(item).find('a')[2]).before(" | ");
	    }
	    histLink.insertAfter($(item).find('a')[2]).before(" | ");
	});
}