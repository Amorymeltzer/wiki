if (mw.config.get("wgCanonicalSpecialPageName") == "AbuseLog") {
	if (mw.util.getParamValue('wpSearchUser') || mw.util.getParamValue('wpSearchFilter') || mw.util.getParamValue('wpSearchTitle')) {
		$("ul.plainlinks").before("<div style='display:inline-block;' id='addOSParam'><input type='button' class='autoClick' id='autoClick' value='Autoclick'></div>");

		//attach handlers
    	$("#autoClick").click(function() {
			var links = $('.plainlinks li');
	    	$.each(links, function(k, link) {
				link = $(link);
				var last = link.find('a')[link.find('a').length-1];
				$(last).attr('href', $(last).attr('href') + '&autoclick=1');
	    	});
		});
		
		$("ul.plainlinks").before("<div style='display:inline-block;' id='jsClick'><input type='button' class='jsClick' id='jsClick' value='Click adjust'></div>");

    	$("#jsClick").click(function() {
			var links = $('.plainlinks li');
		    $.each(links, function(k, link) {
			link = $(link);
			var last = link.find('a')[link.find('a').length-1];
			$(last).attr('target', '_blank');
			last.click();
		    });
    	});

	} else if (mw.util.getParamValue('wphidden') && mw.util.getParamValue('wpreason') && mw.util.getParamValue('hide') && mw.util.getParamValue('autoclick')) {
		$('.oo-ui-buttonInputWidget')[0].firstChild.click();
	}
}

if (mw.config.get('wgPageName') == 'User:Amorymeltzer/Wikipedia:Requests_for_page_protection') {
	importScript('User:Amorymeltzer/qrfpp.js/test.js');
}

importScript('User:Amorymeltzer/unhide.js');