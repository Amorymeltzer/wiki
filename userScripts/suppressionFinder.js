//[[User:Writ Keeper/Scripts/deletionFinder.js]] but for suppression

$(document).ready(suppChecker);

function suppChecker() {
	if (mw.config.get('wgRelevantPageIsProbablyEditable') && mw.config.exists('wgRelevantPageName')) {
		var pageName = mw.config.get('wgRelevantPageName');
		encodedTitle = encodeURIComponent(pageName);
		var suppRequest = $.get("/w/api.php?action=query&list=logevents&format=json&leprop=ids&letype=suppress&letitle=" + encodedTitle + "&lelimit=1", null, suppCallback, "json");
	}
}
function suppCallback(suppResults) {
	if (typeof suppResults.query.logevents[0] !== 'undefined') {	
		var searchNode = " <a id='prevsuppsLink' target='_blank'><span style='font-size:x-small; color:#95F;'>supps</span></a>";
		$("#firstHeading").append(searchNode);
		$("#prevsuppsLink").attr("href", mw.config.get("wgServer") + "/w/index.php?title=Special%3ALog&type=suppress&page=" + encodedTitle);
	}
}