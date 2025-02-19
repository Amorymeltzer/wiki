// Taken from https://en.wikipedia.org/w/index.php?title=User:Bellezzasolo/Scripts/adminhighlighter.js&oldid=829278273
// Inspired from
// https://en.wikipedia.org/w/index.php?title=User:Amalthea/userhighlighter.js&oldid=437693511
//
// Features added:
// - Apply to IA, CU, OS, 'crats', AC members in addition to sysops
// - JSON data (~36KB) is cached locally for speed
// - Allow custom order (set window.highlight_order)
// - Allow custom caching length (set window.cache_hours)
// - Allow application of all user classes (set window.all_groups)
// - Preserve previous classes
// - Don't highlight talkpage discussion tools links
//
// If you want to set a custom order, add something like
// window.highlight_order = ['arbcom', 'bureaucrat', 'oversight', 'checkuser', 'interface-admin', 'sysop', 'steward'];
// to your common.js file where you load this script.
//
// If you want different colors, add something like
// .userhighlighter_bureaucrat {background-color: red !important}
// to your common.css file.
//
// If you want to apply multiple changes for users with more than one group, add
// window.all_groups = true;
// to your common.js file where you load this script.
//
// Caching taken from:
// Galobtter: https://en.wikipedia.org/w/index.php?title=User:Galobtter/scripts/adminhighlighter.js&oldid=910026828
// L235: https://en.wikipedia.org/w/index.php?title=User:L235/customhighlighter.js&oldid=912068642
// <nowiki>


(function($) {
var highlight_order = window.highlight_order || ['arbcom', 'bureaucrat', 'oversight', 'checkuser', 'interface-admin', 'sysop', 'steward'];
var all_groups = window.all_groups || false;
if (all_groups) {
	highlight_order.reverse();
}

// Core function for applying classes to the parsed JSON data
var main = function(data) {
	var ADMINHIGHLIGHT_EXTLINKS = window.ADMINHIGHLIGHT_EXTLINKS || false;
	var ADMINHIGHLIGHT_NAMESPACES = [-1, 2, 3];
	var classDefs = {
		'arbcom': '888888',
		'bureaucrat': '5588FF',
		'oversight': 'DD66DD',
		'checkuser': 'FFFF00',
		'interface-admin': '66DD66',
		'sysop': '00FFFF',
		'steward': 'FF9933'
	};

	mw.loader.using(['mediawiki.util', 'mediawiki.Title'], function() {
		for (var perm in highlight_order) {
			mw.util.addCSS('.userhighlighter_' + highlight_order[perm] + ' {background-color: #' + classDefs[highlight_order[perm]] + '}');
		}

		$('#mw-content-text a').each(function(index, linkraw) {
			try {
				var link = $(linkraw);
				var href = link.attr('href');
				if (!href || href === '/wiki/' || href.charAt(0) === '#') {
					return;
				} // Skip <a> elements that aren't actually links; skip anchors
				if (href.lastIndexOf('http://', 0) !== 0 && href.lastIndexOf('https://', 0) !== 0 && href.lastIndexOf('/', 0) !== 0) {
					return;
				} // require http(s) links, avoid "javascript:..." etc.
				if (link[0].parentElement.className && link[0].parentElement.classList[0] === 'autocomment') {
					return;
				} // Skip span.autocomment links aka automatic section links in edit summaries
				if (link[0].tagName === 'IMG') {
					return;
				} // Don't highlight image links or talk page discussion tools links
				if (link[0].className && (link[0].classList[0] === 'external' || link[0].classList[0] === 'ext-discussiontools-init-timestamplink')) {
					return;
				} // Avoid errors on hard-to-parse external links
				href = href.replace(/%(?![0-9a-fA-F][0-9a-fA-F])/g, '%25');
				var url = new URL(href, window.location.origin);
				if (!ADMINHIGHLIGHT_EXTLINKS && url.searchParams.size) {
					return;
				} // Skip links with query strings if highlighting external links is disabled
				if (url.host === 'en.wikipedia.org') {
					var mwtitle = new mw.Title(mw.util.getParamValue('title', href) || decodeURIComponent(url.pathname.slice(6))); // Try to get the title parameter of URL; if not available, remove '/wiki/' and use that
					if ($.inArray(mwtitle.getNamespaceId(), ADMINHIGHLIGHT_NAMESPACES) >= 0) {
						var user = mwtitle.getMain().replace(/_/g, ' ');
						if (mwtitle.getNamespaceId() === -1) {
							user = user.replace('Contributions/', '');
						}
						$.each(highlight_order, function(_ix, ug) {
							if (data[ug][user] === 1) {
								link.addClass('userhighlighter_' + ug);
								return all_groups; // Exit on first match if false, continue if true
							}
						});
					}
				}
			} catch (e) {
				// Sometimes we will run into unparsable links, so just log these and move on
				mw.log.warn('crathighlighter.js unparsable link', e.message, linkraw);
			}
		});
	});
};

// Grab or generate the user data then actually run the main function
var crathighlighterdata;
try {
	crathighlighterdata = JSON.parse(localStorage.getItem('crathighlighterjson'));
} catch (e) {
	mw.log.error('crathighlighter: failed to parse local storage', e.message);
}
var cache_len = window.cache_hours || 1;
cache_len *= 60 * 60 * 1000; // milliseconds
if (!crathighlighterdata || !crathighlighterdata.date || (Date.now() - new Date(crathighlighterdata.date).getTime()) > cache_len) {
	crathighlighterdata = {};
	var promises = [];
	var baseUrl = '/w/index.php?action=raw&ctype=application/json&title=User:AmoryBot/crathighlighter.js/';
	$.each(highlight_order, function(idx, perm) {
		var url = baseUrl + perm + '.json';
		var deferred = $.getJSON(url, function(data) {
			crathighlighterdata[perm] = data;
		});
		promises.push(deferred);
	});

	$.when.apply(null, promises).then(function() {
		crathighlighterdata.date = Date.now();
		localStorage.setItem('crathighlighterjson', JSON.stringify(crathighlighterdata));
		main(crathighlighterdata);
	});
} else {
	main(crathighlighterdata);
}
})(jQuery);
// </nowiki>
