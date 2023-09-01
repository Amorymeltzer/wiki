// Combines [[User:Writ Keeper/Scripts/deletionFinder.js]] and [[User:Writ Keeper/Scripts/googleTitle.js]]
// [[Special:PermaLink/832071460]] and [[Special:PermaLink/819463472]]

// Add move log
// Change colors

$(document).ready(delgoogChecker);
var pageName = mw.config.get('wgRelevantPageName');
var encodedTitle = encodeURIComponent(pageName);

function delgoogChecker() {
	if (mw.config.get('wgRelevantPageIsProbablyEditable') && mw.config.exists('wgRelevantPageName')) {
		if (mw.config.get('wgCanonicalNamespace') === '' || mw.config.get('wgCanonicalNamespace') === 'Draft')
			var subjectName;
			if (pageName.charAt(pageName.length - 1) === ')') {
				subjectName = pageName.substring(0, pageName.lastIndexOf('(') - 1);
			} else {
				subjectName = pageName;
			}
			var newNode = " <a href='http://www.google.com/search?q=" + encodeURIComponent(subjectName.replace(/_/g, ' ')).replace(/'/g, '%27') + "+-wikipedia.org' target='_blank'><span style='font-size:x-small; color:#5C5'>Google</span></a>";
			$('#firstHeading').append(newNode);
		}
		var delRequest = $.get('/w/api.php?action=query&list=logevents&format=json&leprop=ids&letype=delete&letitle=' + encodedTitle + '&lelimit=1', null, delCallback, 'json');
		var movRequest = $.get('/w/api.php?action=query&list=logevents&format=json&leprop=ids&letype=move&letitle=' + encodedTitle + '&lelimit=1', null, movCallback, 'json');
		var afdRequest = $.get('/w/api.php?action=query&list=allpages&format=json&apfrom=Articles%20for%20deletion%2F' + encodedTitle + '&apto=Articles%20for%20deletion%2F' + encodedTitle + '&apnamespace=4&aplimit=1', null, afdCallback, 'json');
	}
}
function afdCallback(afdResults) {
	if (afdResults.query && typeof afdResults.query.allpages[0] !== 'undefined') {
		var searchNode = " <a id='prevAFDsLink' target='_blank'><span style='font-size:x-small; color:#7F98B2;'>AfDs</span></a>";
		$('#firstHeading').append(searchNode);
		$('#prevAFDsLink').attr('href', mw.config.get('wgServer') + '/w/index.php?title=Special%3AAllPages&from=Articles+for+deletion%2F' + encodedTitle + '&to=Articles+for+deletion%2F' + encodedTitle + '+%289z%29&namespace=4');
	}
}
function delCallback(delResults) {
	if (delResults.query && typeof delResults.query.logevents[0] !== 'undefined') {
		var searchNode = " <a id='prevDelsLink' target='_blank'><span style='font-size:x-small; color:#C55;'>dels</span></a>";
		$('#firstHeading').append(searchNode);
		$('#prevDelsLink').attr('href', mw.config.get('wgServer') + '/w/index.php?title=Special%3ALog&type=delete&page=' + encodedTitle);
	}
}
function movCallback(movResults) {
	if (movResults.query && typeof movResults.query.logevents[0] !== 'undefined') {
		var searchNode = " <a id='prevMovsLink' target='_blank'><span style='font-size:x-small; color:#95F;'>moves</span></a>";
		$('#firstHeading').append(searchNode);
		$('#prevMovsLink').attr('href', mw.config.get('wgServer') + '/w/index.php?title=Special%3ALog&type=move&page=' + encodedTitle);
	}
}
