//Taken from https://en.wikipedia.org/w/index.php?title=User:Bellezzasolo/Scripts/adminhighlighter.js&oldid=829278273
//Inspired from https://en.wikipedia.org/w/index.php?title=User:Amalthea/userhighlighter.js&oldid=437693511
//Apply to sysops, IA, CU, OS, 'crats', AC members
//
//If you want different colors, add something like
//.userhighlighter_bureaucrat {background-color: red !important}
//to your modern.css file.
//
//Not at all friendly to other styles, erases 'em all completely
//<nowiki>

;(function($, mw){
    var acdata, crdata, osdata, cudata, iadata, sydata, swdata;
    $.when(
	$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amorymeltzer/crathighlighter.js/arbcom.json', function(data){
	    acdata = data;
	}),
	$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amorymeltzer/crathighlighter.js/bureaucrat.json', function(data){
	    crdata = data;
	}),
	$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amorymeltzer/crathighlighter.js/oversight.json', function(data){
	    osdata = data;
	}),
	$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amorymeltzer/crathighlighter.js/checkuser.json', function(data){
	    cudata = data;
	}),
	$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amorymeltzer/crathighlighter.js/interface-admin.json', function(data){
	    iadata = data;
	}),
	$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amalthea_(bot)/userhighlighter.js/sysop.js', function(data){
	    sydata = data;
	}),
	$.getJSON('/w/index.php?action=raw&ctype=application/json&title=User:Amorymeltzer/crathighlighter.js/steward.json', function(data){
	    swdata = data;
	})
    ).then(function() {
	ADMINHIGHLIGHT_EXTLINKS = window.ADMINHIGHLIGHT_EXTLINKS || false;
	ADMINHIGHLIGHT_NAMESPACES = [-1,2,3];
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
			    if(acdata[user] == 1) {
				link.attr("class", "userhighlighter_arbcom");
			    }
			    else if(crdata[user] == 1) {
				link.attr("class", "userhighlighter_bureaucrat");
			    }
			    else if(osdata[user] == 1) {
				link.attr("class", "userhighlighter_oversight");
			    }
			    else if(cudata[user] == 1) {
				link.attr("class", "userhighlighter_checkuser");
			    }
			    else if(iadata[user] == 1) {
				link.attr("class", "userhighlighter_interface-admin");
			    }
			    else if (sydata[user] == 1) {
				link.attr("class", "userhighlighter_sysop");
			    }
			    else if (swdata[user] == 1) {
				link.attr("class", "userhighlighter_steward");
			    }
			}
		    }
		} catch (e) {
		    console.log(linkraw);
		    // Sometimes we will run into unparsable links, so just log these and move on
		    window.console && console.error('Admin highlighter recoverable error',e.message);
		}
	    });
	});
    });
}(jQuery, mediaWiki));
//</nowiki>
