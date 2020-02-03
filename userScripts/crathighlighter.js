// Taken from https://en.wikipedia.org/w/index.php?title=User:Bellezzasolo/Scripts/adminhighlighter.js&oldid=829278273
// Inspired from
// https://en.wikipedia.org/w/index.php?title=User:Amalthea/userhighlighter.js&oldid=437693511
//
// Features added:
// - Apply to sysops, IA, CU, OS, 'crats', AC members
// - JSON data (~36KB) is cached locally for an hour
// - Allow custom order (set window.highlight_order)
//
// If you want to set a custom order, add something like
// window.highlight_order = ['acdata', 'crdata', 'osdata', 'cudata', 'iadata', 'sydata', 'swdata'];
// to your common.js file where you load this script
//
// If you want different colors, add something like
// .userhighlighter_bureaucrat {background-color: red !important}
// to your common.css file.
//
// Not at all friendly to other styles, erases 'em all completely
//
// Caching taken from:
// Galobtter: https://en.wikipedia.org/w/index.php?title=User:Galobtter/scripts/adminhighlighter.js&oldid=910026828
// L235: https://en.wikipedia.org/w/index.php?title=User:L235/customhighlighter.js&oldid=912068642
//<nowiki>

var main = function(data) {
	ADMINHIGHLIGHT_EXTLINKS = window.ADMINHIGHLIGHT_EXTLINKS || false;
	ADMINHIGHLIGHT_NAMESPACES = [-1,2,3];
	highlight_order = window.highlight_order || ['acdata', 'crdata', 'osdata', 'cudata', 'iadata', 'sydata', 'swdata'];
	classLookup = {
		acdata: 'userhighlighter_arbcom',
		crdata: 'userhighlighter_bureaucrat',
		osdata: 'userhighlighter_oversight',
		cudata: 'userhighlighter_checkuser',
		iadata: 'userhighlighter_interface-admin',
		sydata: 'userhighlighter_sysop',
		swdata: 'userhighlighter_steward'
	};
	mw.loader.using(['mediawiki.util','mediawiki.Uri', 'mediawiki.Title'], function() {
		mw.util.addCSS(".userhighlighter_arbcom {background-color: #888888}");
		mw.util.addCSS(".userhighlighter_bureaucrat {background-color: #5588FF}");
		mw.util.addCSS(".userhighlighter_oversight {background-color: #DD66DD}");
		mw.util.addCSS(".userhighlighter_checkuser {background-color: #FFFF00}");
		mw.util.addCSS(".userhighlighter_interface-admin {background-color: #66DD66}");
		mw.util.addCSS(".userhighlighter_sysop {background-color: #00FFFF}");
		mw.util.addCSS(".userhighlighter_steward {background-color: #FF9933}");
		$('#mw-content-text a').each(function(index,linkraw){
			try {
				var link = $(linkraw);
				var url = link.attr('href');
				if (!url || url === '/wiki/' || url.charAt(0) === '#') return; // Skip <a> elements that aren't actually links; skip anchors
				if (url.lastIndexOf("http://", 0) !== 0 && url.lastIndexOf("https://", 0) !== 0 && url.lastIndexOf("/", 0) !== 0) return; //require http(s) links, avoid "javascript:..." etc. which mw.Uri does not support
				if (link[0].parentElement.className && link[0].parentElement.classList[0] == 'autocomment') return; // Skip span.autocomment links aka automatic section links in edit summaries
				if (link[0].className && link[0].classList[0] == 'external') return; // Avoid errors on hard-to-parse external links
				var uri = new mw.Uri(url);
				if (!ADMINHIGHLIGHT_EXTLINKS && !$.isEmptyObject(uri.query)) return; // Skip links with query strings if highlighting external links is disabled
				if (uri.host == 'en.wikipedia.org') {
					var mwtitle = new mw.Title(mw.util.getParamValue('title',url) || decodeURIComponent(uri.path.slice(6))); // Try to get the title parameter of URL; if not available, remove '/wiki/' and use that
					if ($.inArray(mwtitle.getNamespaceId(), ADMINHIGHLIGHT_NAMESPACES)>=0) {
						var user = mwtitle.getMain().replace(/_/g," ");
						if (mwtitle.getNamespaceId() === -1) user = user.replace('Contributions/','');
						$.each(highlight_order, function(_ix, ug) {
							if(data[ug][user] === 1) {
								link.attr("class", classLookup[ug]);
								return false;
							}
						});
					}
				}
			} catch (e) {
				console.log(linkraw);
				// Sometimes we will run into unparsable links, so just log these and move on
				window.console && console.error('Admin highlighter recoverable error',e.message);
			}
		});
	});
};


try {
	var crathighlighterdata = JSON.parse(localStorage.getItem('crathighlighterjson'));
} catch(e) {
	console.error('crathighlighter: failed to parse cached json object', e.message);
}
if (!crathighlighterdata || !crathighlighterdata.date || (Date.now() - crathighlighterdata.date) > 3600000) { // 1 hour in milliseconds
	crathighlighterdata = {};
	$.when(
		$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amorymeltzer/crathighlighter.js/arbcom.json', function(data){
			crathighlighterdata.acdata = data;
		}),
		$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amorymeltzer/crathighlighter.js/bureaucrat.json', function(data){
			crathighlighterdata.crdata = data;
		}),
		$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amorymeltzer/crathighlighter.js/oversight.json', function(data){
			crathighlighterdata.osdata = data;
		}),
		$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amorymeltzer/crathighlighter.js/checkuser.json', function(data){
			crathighlighterdata.cudata = data;
		}),
		$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amorymeltzer/crathighlighter.js/interface-admin.json', function(data){
			crathighlighterdata.iadata = data;
		}),
		$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amalthea_(bot)/userhighlighter.js/sysop.js', function(data){
			crathighlighterdata.sydata = data;
		}),
		$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amorymeltzer/crathighlighter.js/steward.json', function(data){
			crathighlighterdata.swdata = data;
		})
	).then(function() {
		crathighlighterdata.date = Date.now();
		localStorage.setItem('crathighlighterjson', JSON.stringify(crathighlighterdata));
		main(crathighlighterdata);
	});
} else {
	main(crathighlighterdata);
}
//</nowiki>
