// Modified version of [[User:Sam Sailor/Scripts/WRStitle.js] at [[Special:PermaLink/844962945]]
// Add custom link color so it's visible on modern

// This is a modified version of [[:en:User:Writ Keeper/Scripts/googleTitle.js]] ([[:en:Special:PermaLink/819463472]])
// Docs: [[:en:User:Sam Sailor/Scripts/WRStitle]]
// Adds a little blue "WRS" link to the right of an article title that will open up a Wikipedia Reference Search (WP:WRS) in a new tab

$(document).ready(function() {
	if (mw.config.get('wgCanonicalNamespace') === '') {
		var subjectName;
		var pageName = mw.config.get('wgPageName');
		if (pageName.charAt(pageName.length - 1) === ')') {
			subjectName = pageName.substring(0, pageName.lastIndexOf('(') - 1);
		} else {
			subjectName = pageName;
		}
		var newNode = " <a href='https://www.google.com/custom?hl=en&cx=007734830908295939403%3Agalkqgoksq0&cof=FORID%3A13%3BAH%3Aleft%3BCX%3AWikipedia%2520Reference%2520Search&q=" + encodeURIComponent(subjectName.replace(/_/g, ' ')).replace(/'/g, '%27') + "' target='_blank'><span style='font-size:x-small; color:#99f;'>WRS</span></a>";
		$('#firstHeading').append(newNode);
	}
});
