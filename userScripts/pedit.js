//Inspired by [[User:Smith609/toolbox.js]]
//Taken from https://en.wikipedia.org/w/index.php?title=User:Smith609/toolbox.js&oldid=281341033
//Editing tools restricted to mainspace
//See also [[User:Amorymeltzer/pinfo.js]]

if (mw.config.get("wgNamespaceNumber") == "0") {
    $(function () {
	var pTb = document.getElementById("p-tb");
	var pEdit = pTb.cloneNode(true);

	pEdit.id = "p-edit";
	pEdit.innerHTML = "<h3>Edit</h3><div class=pBody><ul></ul></div>";
	pTb.parentNode.insertBefore(pEdit, pTb.nextSibling);


	mw.loader.load('ext.gadget.Prosesize'); //[[Wikipedia:Prosesize]] at [[MediaWiki:Gadget-Prosesize.js]], rewritten from  [[User:Dr_pda/prosesize.js]]
	mw.util.addPortletLink("p-edit", '//toolserver.org/~dispenser/view/Peer_reviewer#page:' + mw.config.get("wgPageName"), 'Peer review', 't-peer', "Peer review");
	mw.util.addPortletLink("p-edit", "https://tools.wmflabs.org/refill/ng/result.php?page=" + encodeURIComponent(mw.config.get('wgPageName')) + "&defaults=y&wiki=en", "reFill 2", "t-reflinks" ); //[[User:Zhaofeng Li/reFill]], [[m:User:Zhaofeng_Li/Reflinks.js]], [[toollabs:refill]]
	mw.loader.load("https://meta.wikimedia.org/w/index.php?title=User:Zhaofeng_Li/Reflinks.js&oldid=18773634&action=raw&ctype=text/javascript");
	//    importScript('User:Lourdes/Backlinks.js'); //[[User:Lourdes/Backlinks.js]]
	mw.util.addPortletLink("p-edit", '//edwardbetts.com/find_link/' + mw.config.get("wgPageName"), 'Find backlinks', 't-findlink', "Find potential backlinks for this page"); //[[User:Edward/Find link]]
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Evad37/duplinks-alt.js&oldid=879886064&action=raw&ctype=text/javascript'); //[[User:Evad37/duplinks-alt]], [[User:Evad37/duplinks-alt.js]] replaced [[User:Ucucha/duplinks.js]]

	if ($.inArray('All article disambiguation pages', mw.config.get('wgCategories' )) >= 0) {
	    mw.util.addPortletLink("p-edit", "//dispenser.info.tm/~dispenser/cgi-bin/dabfix.py?page=" + mw.config.get("wgPageName"), "DabFix", "pt-dabfix", "DabFix");
	} else {
	    mw.util.addPortletLink("p-edit", "//dispenser.info.tm/~dispenser/cgi-bin/dab_solver.py?page=" + mw.config.get("wgPageName"), "DabSolve", "pt-dabsolve", "DabSolve");
	}

	mw.util.addPortletLink("p-edit", 'https://dispenser.info.tm/~dispenser/cgi-bin/webchecklinks.py?page=' + mw.config.get("wgPageName"), 'Checklinks', 't-checklinks', "Checklinks");
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Qwertyytrewqqwerty/DisamAssist.js&oldid=829726913&action=raw&ctype=text/javascript'); //[[User:Qwertyytrewqqwerty/DisamAssist.js]], [[User:Qwertyytrewqqwerty/DisamAssist]]
	mw.loader.load('ext.gadget.citations'); //[[MediaWiki:Gadget-citations.js]]
	mw.util.addPortletLink("p-edit", '//tools.wmflabs.org/iabot/index.php?page=runbotsingle&pagesearch=' + mw.config.get("wgPageName"), 'IABot', 't-iabot', "Load the IA bot interface");

	/*
	  importScript('Wikipedia:AutoEd/complete.js'); //[[Wikipedia:AutoEd/complete.js]]
	  importScript('User:Amorymeltzer/dashes.js'); //[[User:GregU/dashes.js]]
	  //Activates individual modules when "auto ed" tab is clicked
	  function autoEdFunctions() {
	  var txt = document.editform.wpTextbox1;
	  txt.value = autoEdDashes(txt.value);
	  }
	*/

	if (mw.config.get("wgAction") == "edit" || mw.config.get("wgAction") == "submit") {
	    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Salix_alba/Citoid.js&oldid=823130457&action=raw&ctype=text/javascript'); //[[User:Salix_alba/Citoid.js]]
	    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Ohconfucius/script/formatgeneral.js&oldid=924349868&action=raw&ctype=text/javascript'); //[[User:Ohconfucius/script/formatgeneral.js]]
	    //importScript('User:Ohconfucius/script/Common Terms.js'); //[[User:Ohconfucius/script/Common Terms.js]] Hide countries, etc. Loads outdated regex menu framework, annoying
	    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Dr_pda/editrefs.js&oldid=847786367&action=raw&ctype=text/javascript'); //[[User:Dr_pda/editrefs.js]] Show on mainpage as well, like autoed?
	    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Meteor_sandwich_yum/Tidy_citations.js&oldid=600543255&action=raw&ctype=text/javascript'); //[[User:Meteor sandwich yum/Tidy citations.js]]

	    //These aren't in the sidebar, but are relevant to mainspace editing, so loaded here rather than in modern.js for convenience
	    importScript('User:Amorymeltzer/ARAspaceless.js'); //[[User:TheJJJunk/ARA.js]]
	    importScript('User:Amorymeltzer/AdvisorDashless.js'); //[[User:Cameltrader/Advisor.js]] and [[User:PC-XT/Advisor.js]] Doesn't work with beta syntax highlighters
	    mw.loader.load('ext.gadget.ProveIt'); //[[MediaWiki:Gadget-ProveIt.js]] [[WP:ProveIt]] [[commons:MediaWiki:Gadget-ProveIt.js]]
	    mw.loader.load('//de.wikipedia.org/w/index.php?title=Benutzer:TMg/autoFormatter.js&oldid=192882659&action=raw&ctype=text/javascript'); //[[m:User:TMg/autoFormatter]]
	}
    });
}
