/*jshint maxerr:999*/
/*
  This page is designed to only load items on specific pages
  It makes use of an irresponsible number of if-else statements
  The main loop covers whether a page is Special or not
  The secondary loop covers page actions
  There are some exceptions afterward for mixed situations
  But first, load scripts wanted everywhere
*/
/*Everywhere*/

//Config for [[Wikipedia:Tools/Navigation popups]], [[MediaWiki:Gadget-popups.js]], [[MediaWiki:Gadget-navpop.css]]
window.popupAdminLinks = true;
window.popupPreviewFirstParOnly = false; //Default is true
window.popupMaxPreviewSentences = 6; //Default is 5
window.popupMaxPreviewCharacters = 800; //Default is 600
window.popupPreviewKillTemplates = false; //Default is true
window.popupPreviewRawTemplates = false; //Default is true
window.popupOnlyArticleLinks = false; //Default is true
window.popupFixDabs = true; //Default is false
window.popupRedlinkRemoval = true; //Default is false
window.popupEditCounterTool = 'custom'; //Default is supercount
window.popupEditCounterUrl = 'https://xtools.wmflabs.org/ec/en.wikipedia.org/$1';
window.popupHistoryPreviewLimit = 35; //Default is 25
window.popupContribsPreviewLimit = 35; //Default is 25
window.popupThumbAction = 'sizetoggle'; //Default is 'imagepage'
window.popupSetupMenu = false;  //Default is true
window.popupLastEditLink = false; //Default is true

//Config for [[Wikipedia:Comments in Local Time]], [[User:Gary/comments in local time.js]]
window.LocalComments = {
    dateDifference: true,
    //        dateFormat: 'dmy',
    //        timeFirst: true,
    twentyFourHours: true,
    //        dayOfWeek: true,
    //        dropMonths: 0,
    dropDays: 62
};

//Might reload the page
importScript('User:Amorymeltzer/unhide.js'); //[[User:Amorymeltzer/unhide.js]]
//[[MediaWiki:Gadget-markblocked.js]] originally installed via [[User:NuclearWarfare/Mark-blocked script.js]], now loaded via prefs
importScript('User:Amorymeltzer/seventabs.js'); //[[User:Amorymeltzer/seventabs.js]], a much improved version of [[Wikipedia:WikiProject User scripts/Scripts/Six tabs]]
//window.ADMINHIGHLIGHT_EXTLINKS = true;
importScript('User:Amorymeltzer/crathighlighter.js'); //[[User:Bellezzasolo/Scripts/adminhighlighter.js]], [[User:Ais523/adminrights.js]], [[User:Amalthea/userhighlighter.js]], [[User:Amorymeltzer/crathighlighter.js]]
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Lenore/autolink.js&oldid=653625612&action=raw&ctype=text/javascript'); //[[User:Lenore/autolink.js]], [[User:Lenore/autolink]] Try to display templates, etc in comments everywhere
//importScript('User:Amorymeltzer/nulledit.js'); //[[User:MZMcBride/nulledit.js]], [[User:Splarka/nulledit.js]], [[User:Amorymeltzer/nulledit.js]]
importScript('User:Amorymeltzer/pinfo.js'); //[[User:Smith609/toolbox.js]], [[User:קיפודנחש/viewstats.js]], [[User:Amorymeltzer/pinfo.js]]
//importScript('User:Amorymeltzer/ajaxsendcomment.js'); //[[User:Splarka/ajaxsendcomment.js]] Remove when reclick? [[User:Amorymeltzer/ajaxsendcomment.js]]
importScript('User:Amorymeltzer/pagemods.js'); //[[User:Amorymeltzer/pagemods.js]
/* Should probably make these next two more specific */
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/more-listing-items.js&oldid=882933273&action=raw&ctype=text/javascript'); //[[User:Enterprisey/more-listing-items.js]]
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Suffusion_of_Yellow/filter-highlighter.js&oldid=930753959&action=raw&ctype=text/javascript'); //[[User:Suffusion_of_Yellow/filter-highlighter.js]]

//Quick access for quick access
$(function () {
    mw.util.addPortletLink("p-personal", "//en.wikipedia.org/w/index.php?title=Special:Log&user=Amorymeltzer", "My logs", "pt-mylogs", "Your logged actions", "", '#pt-logout');
    mw.util.addPortletLink("p-personal", mw.util.getUrl('User:Amorymeltzer/mass'), 'Mass', 'p-mass', "MASS"); //[[User:Amorymeltzer/mass]]
    mw.util.addPortletLink("p-personal", mw.util.getUrl('User:Amorymeltzer/perm'), 'Perm', 'p-perm', 'PERM'); //[[User:Amorymeltzer/perm]]
    mw.util.addPortletLink("p-personal", "//en.wikipedia.org/wiki/User:Amorymeltzer/dash?action=purge", 'Dash', 'p-dash', 'Dashboard');
    mw.util.addPortletLink("p-personal", "//tools.wmflabs.org/copypatrol/en", 'Copy', 'p-copypatrol', 'Copyright patrol');
    mw.util.addPortletLink("p-personal", "//en.wikipedia.org/wiki/Wikipedia:Usernames_for_administrator_attention?action=purge", 'UAA', 'p-uaa', 'UAA');
    mw.util.addPortletLink("p-personal", "//en.wikipedia.org/wiki/Wikipedia:Administrator_intervention_against_vandalism?action=purge", 'AIV', 'p-aiv', 'AIV');
    mw.util.addPortletLink("p-personal", "//en.wikipedia.org/wiki/Wikipedia:Requests_for_page_protection?action=purge", 'RFPP', 'p-rfpp', 'RFPP');
    mw.util.addPortletLink("p-personal", "//en.wikipedia.org/wiki/User:Amorymeltzer/Subpage_of_plus_one_efficiency?action=purge", 'plus one', 'p-plusone', 'Efficiency FTW', '-');
    mw.util.addPortletLink("p-navigation", mw.util.getUrl('Special:RandomRedirect'), 'Random redirect', 'n-randomredirect', 'Load a random redirect', 'a');
    mw.util.addPortletLink("p-navigation", mw.util.getUrl('Special:RandomInCategory/All article disambiguation pages'), 'Random disam', 'n-randomdisam', 'Random disambiguation page', 'b');
});

/*
  Is the page Special or not, and if so, choose between the various sub-options
*/
/*Special*/
if (mw.config.get('wgCanonicalNamespace') === 'Special') {
    /*Contributions*/
    if (mw.config.get('wgCanonicalSpecialPageName') === 'Contributions') {
	if ($('.mw-contributions-list').length) { //Save some space
	    var paraGone = $('.mw-contributions-list')[0].previousSibling; //Remove <p> tag revision date nav
	    $(paraGone).replaceWith(paraGone.childNodes);
	}

	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Markhurd/hidetopcontrib.js&oldid=934625836&action=raw&ctype=text/javascript'); //[[User:Markhurd/hidetopcontrib.js]]
	window.userHideAllSubsequent=true;
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Writ_Keeper/Scripts/massRollback.js&oldid=882368814&action=raw&ctype=text/javascript'); //[[User:Writ Keeper/Scripts/massRollback.js]]

	//Create button to turn on [[User:Writ Keeper/Scripts/massRevdel.js]]
	//Script is immensely helpful, but the individual links and OS bolding are as well
	$('.mw-contributions-list').before("<span id=toggle_massrevdel class='toggle_massrevdel' style='font-size:85%;'>" +
					   "<span style='margin-left:0.4em;'>(<a style='cursor:pointer;' title='Mass RevDel' class='mass_revdel_on'>Mass RevDel</a>)</span>" +
					   "</span>");
	$(document).on('click', '.mass_revdel_on', function() {
	    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Writ_Keeper/Scripts/massRevdel.js&oldid=937039252&action=raw&ctype=text/javascript'); //[[User:Writ Keeper/Scripts/massRevdel.js]]
	    $('#toggle_massrevdel').remove();
	    //Tighten/shorten massRevdel stuff
	    mw.loader.using(['mediawiki.util'], function() {
		mw.util.addCSS("#revdelCP {margin-left: 0.4em;}");
	    });
	    $(document).on('click', '#revdelCP', function() {
		$('#revdelLabel').text('RevDel >'); //Would prefer this to begin with but so be it
		$('#revdelSelectAll').val('All');
		$('#revdelSelectNone').val('None');
		$('#revdelSubmit').val('RevDel');
		$('#oversightSubmit').val('Oversight');
	    });
	});

	//Shorten revdel; change rollback to r; current to top
	//Adapted from [[User:Writ Keeper/Scripts/watchlistContribs.js]]
	$(function () {
	    $('[class^="mw-uctop"]').each(function(index, link) {
		link.innerHTML = "top";
	    });
	    $('[class^="mw-rollback-link"] a').each(function(index, link) {
		link.innerHTML = link.innerHTML.replace(/rollback: (\d+) edit/, 'roll$1');
	    });
	    $('[class^="mw-revdelundel-link"] a').each(function(index, link) {
		link.innerHTML = "RevDel";
	    });
	});
    } else if (mw.config.get('wgCanonicalSpecialPageName') === 'Watchlist') {
	/*Watchlist*/
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Equazcion/LagToMinutes.js&oldid=788726414&action=raw&ctype=text/javascript'); //[[User:Equazcion/LagToMinutes.js]] Display lag in minutes on watchlist
	importScript('User:Amorymeltzer/ReverseMarked.js'); //[[User:Equazcion/ReverseMarked.js]] Hide visited pages on watchlist [[User:Amorymeltzer/ReverseMarked.js]]
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Evad37/Thanky.js&oldid=928009085&action=raw&ctype=text/javascript'); //[[User:Evad37/Thanky.js]], [[User:Evad37/Thanky]]
    } else if (mw.config.get('wgCanonicalSpecialPageName') === 'Log' || mw.config.get('wgCanonicalSpecialPageName') === 'Userrights') {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/links-in-logs.js&oldid=929485616&action=raw&ctype=text/javascript'); //[[User:Enterprisey/links-in-logs.js]]
	if (mw.config.get('wgCanonicalSpecialPageName') === 'Log') {
	    /*Log*/
	    importScript ('User:Amorymeltzer/logSwap.js'); //[[User:Amorymeltzer/logSwap.js]] initially inspired by [[User:PleaseStand/common.js]]
	}
    } else if (mw.config.get('wgCanonicalSpecialPageName') === 'Whatlinkshere') {
	/*What links here*/
	//Add history and delete links
	importScript('User:Amorymeltzer/wlhActionLinks.js'); //[[meta:User:He7d3r/Tools/AddActionLinks.js]], [[User:Amorymeltzer/wlhActionLinks.js]]
	//Quick count of transclusions and links
	mw.loader.load('//www.wikidata.org/w/index.php?title=MediaWiki:Linkscount.js&action=raw&ctype=text/javascript'); //[[wikidata:MediaWiki:Linkscount.js]]
    } else if (mw.config.get('wgCanonicalSpecialPageName') === 'Block') {
	/*Block*/
	//Automatically watch user talk pages when blocking
	$('input[name=wpWatch]').prop('checked', true);
    } else if (mw.config.get('wgCanonicalSpecialPageName') === 'Search') {
	/*Search*/
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Mr._Stradivarius/gadgets/SearchEditLink.js&oldid=684105738&action=raw&ctype=text/javascript'); //[[User:Mr. Stradivarius/gadgets/SearchEditLink.js]]
	importScript('User:Amorymeltzer/Search_sort.js'); //[[User:Amorymeltzer/Search_sort.js]], [[User:PrimeHunter/Search_sort.js]]
    } else if (mw.config.get('wgCanonicalSpecialPageName') === 'AbuseLog') {
	/*AbuseLog*/
	importScript('User:Amorymeltzer/osal.js'); //[[User:Amorymeltzer/osal.js]]
	/*Masses*/
    } else if (mw.config.get('wgPageName') === 'Special:Massedit') {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Timotheus_Canens/massedit.js&oldid=851213665&action=raw&ctype=text/javascript'); //[[User:Timotheus Canens/massedit.js]]
    } else if (mw.config.get('wgPageName') === 'Special:Massdelete') {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Animum/massdelete.js&oldid=883804308&action=raw&ctype=text/javascript'); //[[User:Animum/massdelete.js]]
    } else if (mw.config.get('wgPageName') === 'Special:Massrestore') {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Timotheus_Canens/massrestore.js&oldid=851214383&action=raw&ctype=text/javascript'); //[[User:Timotheus Canens/massrestore.js]]
    } else if (mw.config.get('wgPageName') === 'Special:Massblock') {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Timotheus_Canens/massblock.js&oldid=851213957&action=raw&ctype=text/javascript'); //[[User:Timotheus Canens/massblock.js]]
    } else if (mw.config.get('wgPageName') === 'Special:MassUnblock') {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Timotheus_Canens/massunblock.js&oldid=851214076&action=raw&ctype=text/javascript'); //[[User:X!/massunblock.js]], [[User:Timotheus Canens/massunblock.js]]
    } else if (mw.config.get('wgPageName') === 'Special:Massprotect') {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Timotheus_Canens/massprotect.js&oldid=851214226&action=raw&ctype=text/javascript'); //[[User:Timotheus Canens/massprotect.js]]
    } else if (mw.config.get('wgPageName') === 'Special:Massmove') {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Plastikspork/massmove.js&oldid=912351042&action=raw&ctype=text/javascript'); //[[User:Plastikspork/massmove.js]]
    }

} else {
    /*
      Load everything that shouldn't be on a special page
      This will eventually devolve to Mainspace or not
    */
    /*Not Special*/
    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Ale_jrb/Scripts/csdhelper.js&oldid=919196814&action=raw&ctype=text/javascript'); //[[User:Ale jrb/Scripts]], [[User:Ale jrb/Scripts/csdhelper.js]]
    var notifyByDefaultDec = true; //default is true
    //var notifyByDefaultDel = true; //default is false
    var notifyByDefaultPrd = true; //default is true
    var notifyByDefaultNew = false; //default is true
    //var csdhDoRedirect = false; //default is true
    var redirectAfterDel = '#';
    //var redirectAfterDel = 'https://en.wikipedia.org/w/index.php?title=Special:Log&user=Amorymeltzer';
    var logOnDecline = true;
    var logOnDeclinePath = 'User:Amorymeltzer/DeclinedCSDs';
    var myDeclineSummary = 'Declining speedy (%CRITERION%) — %REASON%';
    var myDeclineSummarySpecial = 'Declining speedy — %REASON%';
    var overwriteDeclineReasons = true;
    importScript('User:Amorymeltzer/CSDHreasons.js'); //[[User:Amorymeltzer/CSDHreasons.js]] Custom decline reasons, inspired by [[User:SoWhy/csdreasons.js]]

    importScript('User:Amorymeltzer/hideSectionDesktop.js'); //[[User:BethNaught/hideSectionDesktop.js]], [[User:Amorymeltzer/hideSectionDesktop.js]]
    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:The_Earwig/permalink.js&oldid=778745654&action=raw&ctype=text/javascript'); //[[User:The Earwig/permalink.js]]
    importScript('User:Amorymeltzer/pagemods.js'); //Mix of namespaces, actions, etc. [[User:Amorymeltzer/pagemods.js]]

    mw.loader.using(['mediawiki.util'], function() {
	if (mw.util.getParamValue('diff') || mw.util.getParamValue('oldid')) {
	    importScript('User:Amorymeltzer/diff-permalink.js'); //[[User:Enterprisey/diff-permalink.js]]
	}
    });

    //Shorten revdel
    //Should probably combine this with the identical one for Special:Contributions
    $(function () {
	if (mw.config.get('wgRevisionId')) {
	    $('[class^="mw-revdelundel-link"] a').each(function(index, link) {
		link.innerHTML = "RevDel";
	    });
	}
    });

    /*
      Most things aren't needed on articles, so define articles first
      That being said, some things are articles and elsewhere
    */
    /*Articles and Drafts*/
    if ((mw.config.get('wgNamespaceNumber') === 0) || (mw.config.get('wgNamespaceNumber') === 118)) {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:The_Earwig/copyvios.js&oldid=672790910&action=raw&ctype=text/javascript'); //[[User:The Earwig/copyvios.js]]
    }

    /*Articles and Talk*/
    //Only on articles and talk
    if ((mw.config.get('wgNamespaceNumber') === 0) || (mw.config.get('wgNamespaceNumber') === 1)) {
	/* Edit/create redirects with [[User:Wugapodes/Capricorn]] ([[User:Wugapodes/Capricorn.js]])
	 * [[User:Sam Sailor/Scripts/Sagittarius+]] ([[User:Sam Sailor/Scripts/Sagittarius+.js]])
	 * [[User:Kephir/gadgets/sagittarius]] ([[User:Kephir/gadgets/sagittarius.js]]) */
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Wugapodes/Capricorn.js&oldid=938903836&action=raw&ctype=text/javascript');

	//[[User:Evad37/rater.js]], [[User:Evad37/rater/app.js]], [[User:Kephir/gadgets/rater.js]]
	// Loading here rather than via rater.js to get specific version
	mw.loader.using([
	    "mediawiki.util", "mediawiki.api", "mediawiki.Title",
	    "oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows",
	    "oojs-ui.styles.icons-content", "oojs-ui.styles.icons-interactions",
	    "oojs-ui.styles.icons-moderation", "oojs-ui.styles.icons-editing-core",
	    "mediawiki.widgets", "mediawiki.widgets.NamespacesMultiselectWidget",
	], function() {
	    // Do not operate on non-existent pages or their talk pages
	    if (!$("li.new[id|=ca-nstab]").length) {
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Evad37/rater/app.js&oldid=941000678&action=raw&ctype=text/javascript');
	    }
	});
    }

    /*Articles*/
    if (mw.config.get('wgNamespaceNumber') === 0) {
	//[[Wikipedia:HotCat]], [[MediaWiki:Gadget-HotCat.js]], [[commons:Help:Gadget-HotCat]]
	//Installed here to be only in mainspace
	window.hotcat_no_autocommit = true;
	window.hotcat_del_needs_diff = true;
	mw.loader.load('ext.gadget.HotCat');

	importScript('User:Amorymeltzer/pedit.js'); //[[User:Smith609/toolbox.js]], [[User:Amorymeltzer/pedit.js]]
	/*Backlinks for pedit:
	  [[User:Caorongjin/wordcount]], [[User:Caorongjin/wordcount.js]], [[User:Dr_pda/prosesize.js]]
	  [[User:Lourdes/Backlinks.js]], [[m:User:Zhaofeng_Li/Reflinks.js]]], [[User:Lourdes/Backlinks.js]]
	  [[User:Edward/Find link]], [[User:Evad37/duplinks-alt]], [[User:Ucucha/duplinks.js]]
	  [[User:Qwertyytrewqqwerty/DisamAssist.js]], [[MediaWiki:Gadget-citations.js]], [[Wikipedia:AutoEd/complete.js]]
	  [[User:GregU/dashes.js]], [[User:Salix_alba/Citoid.js]], [[User:Ohconfucius/script/formatgeneral.js]]
	  [[User:Ohconfucius/script/Common Terms.js]], [[User:Dr_pda/editrefs.js]], [[User:TheJJJunk/ARA.js]]
	  [[User:Meteor sandwich yum/Tidy citations.js]], [[User:Cameltrader/Advisor.js]], [[User:PC-XT/Advisor.js]]
	  [[MediaWiki:Gadget-ProveIt.js]], [[WP:ProveIt]], [[m:User:TMg/autoFormatter]], [[User:Edward/Find_link]]
	*/
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Gary/smaller_templates.js&oldid=596443737&action=raw&ctype=text/javascript'); //[[User:Gary/smaller templates.js]]
	importScript('User:Amorymeltzer/WRStitle.js'); //[[User:Sam Sailor/Scripts/WRStitle.js]] Link to reference search [[WP:WRS] [[User:Amorymeltzer/WRStitle.js]]
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Gary/subjects_age_from_year.js&oldid=857651049&action=raw&ctype=text/javascript'); //[[User:Gary/subjects age from year.js]]
	//importScript('User:Amorymeltzer/regex.js'); //[[User:Amorymeltzer/regex.js]] Maybe useful if start processing redirects with content again?  Need to make use of TemplateScript main I guess
	mw.loader.load('ext.gadget.XTools-ArticleInfo'); //[[MediaWiki:Gadget-XTools-ArticleInfo.js]], [[mw:XTools/ArticleInfo.js]], [[User:Amorymeltzer/articleinfo-gadget.js]]
    } else {//END ARTICLES
	/*
	  Most scripts aren't needed in mainspace, so load them individually
	  Some will be any nonzero namespace, some in specific categories (WP, etc.)
	*/

	/*Anywhere but articles*/

	//YAAFCH originally from [[User:Timotheus Canens/afchelper4.js]]
	//Manually installed rather than via gadget to keep off User pages
	//[[User:Enterprisey/afch-master.js]], [[User:Enterprisey/afch-master.js/core.js]
	if ($.inArray(mw.config.get('wgCanonicalNamespace'), ['Project', 'Project_talk', 'Draft'])>=0) {
	    mw.loader.load('ext.gadget.afchelper'); //[[MediaWiki:Gadget-afchelper.js]]
	}

	if (mw.config.get('wgNamespaceNumber') === 4) {
	    /*Wikipedia project space, not talk*/
	    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/strike-archived.js&oldid=882398530&action=raw&ctype=text/javascript'); //[[User:Enterprisey/strike-archived.js]], [[User:Enterprisey/strike-archived]]
	    importScript('User:Amorymeltzer/oldafd.js'); //[[User:Splarka/oldafd.js]], [[User:Amorymeltzer/oldafd.js]]
	    importScript('User:Amorymeltzer/responseHelper.js' ); //[[User:MusikAnimal/responseHelper.js]], [[User:Amorymeltzer/responseHelper.js]]
	    importScript('User:Amorymeltzer/userRightsManager.js'); //[[User:MusikAnimal/userRightsManager.js]], [[User:Amorymeltzer/userRightsManager.js]]
	    importScript('User:Amorymeltzer/qrfpp.js'); //[[User:Amorymeltzer/qrfpp.js]] from [[User:Evad37/RPPhelper.js]] and [[User:MusikAnimal/userRightsManager.js]]

	    //importScript('User:Timotheus Canens/spihelper.js'); [[User:Timotheus Canens/spihelper.js]] Not clerking atm. Duplicated in responseHelper?
	    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/delsort.js&oldid=921967289&action=raw&ctype=text/javascript'); //[[User:Enterprisey/delsort.js]]
	    //[[MediaWiki:Gadget-XFDcloser.js]], [[User:Evad37/XFDcloser/v3.js]], [[User:Evad37/XFDcloser.js]], [[User:Mr.Z-man/closeAFD.js]]
	    //Originally installed here to keep off certain pages but now installed via gadget
	    //mw.loader.load('ext.gadget.XFDcloser');
	    /*Only for [[WP:AFC/R]]*/
	    if (mw.config.get('wgPageName') === 'Wikipedia:Articles_for_creation/Redirects') {
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:EnterpriseyBot/AFCRHS.js&oldid=921218533&action=raw&ctype=text/javascript'); //[[User:Enterprisey/AFCRHS]], [[User:EnterpriseyBot/AFCRHS.js]]
	    }
	} else if (mw.config.get('wgNamespaceNumber') === 14) {
	    /*Categories*/
	    importScript('User:Amorymeltzer/CatListMainTalkLinks.js'); //[[User:Equazcion/CatListMainTalkLinks.js]] Display main/talk/hist links for pages in categories [[User:Amorymeltzer/CatListMainTalkLinks.js]]
	} else if (mw.config.get('wgNamespaceNumber') === 6) {
	    /*Files*/
	    //TinEye link, from [[meta:User:Krinkle/Scripts/TinEye]], [[File:Krinkle_TinEye.js]], [[commons:MediaWiki:Gadget-Tineye.js]], [[commons:MediaWiki:Gadget-Tineye]]
	    var imgs = $('#file img');
	    if (imgs.length) {
		mw.util.addPortletLink('p-cactions', 'http://tineye.com/search?url=' + encodeURIComponent(imgs[0].src), 'TinEye', 'ca-tineye');
	    }
	}//END else if LOOP but remain in not articles

	/*WP and all talks*/
	if ((mw.config.get('wgNamespaceNumber') === 4) || (mw.config.get('wgNamespaceNumber')%2 === 1)) {
	    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Pythoncoder/Scripts/voteSymbols.js&oldid=939180044&action=raw&ctype=text/javascript'); //[[User:Ais523/votesymbols.js]], [[User:Pythoncoder/Scripts/voteSymbols.js]], [[User:Pythoncoder/Scripts/voteSymbols]]
	    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Technical_13/Scripts/OneClickArchiver.js&oldid=864149342&action=raw&ctype=text/javascript'); //[[User:Technical 13/Scripts/OneClickArchiver]], [[User:Technical 13/Scripts/OneClickArchiver.js]]
	    window.replyLinkPreloadPing = 'button'; //Don't autoload ping template for reply-link
	    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/reply-link.js&oldid=930407343&action=raw&ctype=text/javascript'); //[[User:Enterprisey/reply-link.js]], [[User:Enterprisey/reply-link]]
	    /*All talks*/
	    if (mw.config.get('wgNamespaceNumber') !== '4') {
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Jackmcbarn/editProtectedHelper.js&oldid=865886460&action=raw&ctype=text/javascript'); //[[User:Jackmcbarn/editProtectedHelper.js]]
		/*User talks*/
		if (mw.config.get('wgNamespaceNumber') === '3') {
		    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/unblock-review.js&oldid=881687292&action=raw&ctype=text/javascript'); //[[User:Enterprisey/unblock-review.js]]
		}
	    }
	}
    }//END not articles

}//END ENTIRE LOOP (not special, etc.)



/*
  A number of items need to load for some special pages and certain actions
  Including them in the above would make it too complex
  Or would require loading them multiple times in different places
  Instead, load them here in overly complex, inefficient, and redundant if statements
  Basically, places where rollback/diffs exist, a username exists, or places with  wikilinks in dropdown menus
*/
/*MIXED*/
if (mw.config.get('wgAction') === 'history' || mw.config.get('wgCanonicalSpecialPageName') === 'Contributions'
    || mw.config.get('wgCanonicalSpecialPageName') === 'Watchlist' || mw.config.get('wgCanonicalSpecialPageName') === 'Recentchanges') {

    /*Hist/watch/rece/contribs*/
    //Shows inline diffs everywhere (hist, watch, recent, contribs)
    inspectText = "show&nbsp;diff";
    showText = "show&nbsp;diff";
    hideText = "hide&nbsp;diff";
    //inlineDiffBigUI = "true"; //Text is hardcoded, breaks above options
    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Writ_Keeper/Scripts/commonHistory.js&oldid=926702438&action=raw&ctype=text/javascript'); //[[User:Writ Keeper/Scripts/commonHistory.js]]
    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Writ_Keeper/rollbackSummary.js&oldid=777687372&action=raw&ctype=text/javascript'); //[[User:Mr.Z-man/rollbackSummary.js]], [[User:Writ Keeper/rollbackSummary.js]]
    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:קיפודנחש/apiRollback.js&oldid=924056620&action=raw&ctype=text/javascript'); //[[User:קיפודנחש/apiRollback.js]]

    if (mw.config.get('wgAction') === 'history' || mw.config.get('wgCanonicalSpecialPageName') === 'Contributions') {
	/*History OR Contribs*/
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Ale_jrb/Scripts/userhist.js&oldid=920398181&action=raw&ctype=text/javascript'); //[[User:Ale jrb/Scripts/userhist.js]]
    }
    if (mw.config.get('wgCanonicalSpecialPageName') != 'Contributions') {
	//Add diffOnly links everywhere but diff pages
	DiffOnly = {
	    history: true,
	    recentchanges: true,
	    watchlist: true,
	    diff: false
	};
	importScript('User:Amorymeltzer/DiffOnly.js'); //[[User:Mr. Stradivarius/gadgets/DiffOnly.js]], [[User:Amorymeltzer/DiffOnly.js]]
    }

}

/*mw.config.exists('wgRelevantUserName')*/
if (mw.config.exists('wgRelevantUserName')) {
    importScript('User:Amorymeltzer/userinfo.js'); //[[User:PleaseStand/userinfo.js]], see also [[User:Equazcion/sysopdetector.js]] Display perms, edit count, age, gender, last edited [[User:Amorymeltzer/userinfo.js]]
    //[[User:Animum/EasyBlock]], but for the modern skin [[User:Animum/easyblock.js]], [[User:Animum/easyblock.css]]
    //Also loads on all diffs; putting it here should be light than just adjusting ebPrefs.showOnPages
    importScript('User:Amorymeltzer/easyblock-modern.js'); //[[User:Amorymeltzer/easyblock-modern.js]], [[User:Amorymeltzer/easyblock-modern.css]]
    ebPrefs = {
	//returnTo:"Wikipedia:Administrator_intervention_against_vandalism&action=purge"
	loadPageOnSubmit:false
    };
}
/*mw.config.get('wgRelevantPageIsProbablyEditable')*/
//Excessive perhaps, but want this after userinfo
if (mw.config.get('wgRelevantPageIsProbablyEditable')) {
    importScript('User:Amorymeltzer/deletionFinder.js'); //[[User:Writ Keeper/Scripts/deletionFinder.js]], [[User:Writ Keeper/Scripts/googleTitle.js]], [[User:Amorymeltzer/deletionFinder.js]]
    importScript('User:Amorymeltzer/suppressionFinder.js'); //[[User:Amorymeltzer/suppressionFinder.js]] As above
}

/*js/css/json pages, likely MediaWiki or userspace*/
if ((['javascript', 'css', 'json'].indexOf(mw.config.get('wgPageContentModel')) !== -1) && ($.inArray(mw.config.get('wgAction'), ['view', 'edit', 'submit'])>=0)) {
    importScript('User:Amorymeltzer/raw.js'); //[[User:Kangaroopower/rawtab.js]], [[User:Amorymeltzer/raw.js]]

    //Show diffs in monospace.  Maybe include Scribunto?
    if (mw.config.get('wgDiffNewId')) {
	$('td.diff-addedline, td.diff-deletedline, td.diff-context').css('font-family',"Consolas, 'Courier New', monospace");
    }

    //Activate wikilinks, from [[Wikipedia:WikiProject User scripts/Scripts/Autolink]]
    //Requires commas between consecutive items
    //Awkward fix to avoid the edit box
    if (mw.config.get('wgAction') == 'view') {
	targetdiv = document.getElementById('mw-content-text');
    } else if (mw.config.get('wgAction') == 'edit' || mw.config.get('wgAction') == 'submit') {
	targetdiv = document.getElementById('wikiPreview');
    }
    content = targetdiv.innerHTML;
    content = content.replace(/([^\[])\[{2}([^\[\]\|<\>\n]*)([^\[\]<\>\n]*?)?\]{2}([^\]])/g, '$1<a class="autolink" href="/wiki/$2">[[$2$3]]</a>$4'); // Make wikilink code into links
    targetdiv.innerHTML = content; // Write it back

    //Add personal js/css nav
    var ss = window.document.getElementsByClassName('subpages')[0];
    if (ss && mw.config.get('wgArticleId')) { //In case the page was deleted
	var modLink = " | <a href=\"/wiki/User:Amorymeltzer/modern.js\" title=\"User:Amorymeltzer/modern.js\">modern.js</a> | <a href=\"/wiki/User:Amorymeltzer/modern.css\" title="
	    + "\"User:Amorymeltzer/modern.css\">modern.css</a> | <a href=\"/wiki/Special:PrefixIndex/User:Amorymeltzer/\" title=\"wiki/Special:PrefixIndex/User:Amorymeltzer/\">subpages</a>";
	ss.innerHTML = ss.innerHTML + modLink;
    }
} else { //Not js/css/json
    if (mw.config.get('wgAction') == 'edit' || mw.config.get('wgAction') == 'submit') {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Anomie/previewtemplatelastmod.js&oldid=683547736&action=raw&ctype=text/javascript'); //[[User:Anomie/previewtemplatelastmod]], [[User:Anomie/previewtemplatelastmod.js]] Display info about transcluded templates
	if (mw.config.get('wgNamespaceNumber') !== 0) {
	    //Turn enhanced toolbar off if not in mainspace
	    //Defined here to easily allow the code editor on the above pages
	    mw.loader.using(['mediawiki.util'], function() {
		mw.util.addCSS("#wikiEditor-ui-toolbar {display:none;}");
	    });
	}
    }
}

/*Delete, (Un)Protect, RevisionDelete, Block, or AbuseLog*/
//Resurrected version of [[User:Ale jrb/Scripts/csdcheck.js]], requires some CSS (Exampless in [[User:Amorymeltzer/csdcheck.js]] or [[User:Amorymeltzer/modern.css]])
if (mw.config.get('wgAction') === 'delete' || mw.config.get('wgAction') === 'protect' || mw.config.get('wgAction') === 'unprotect' ||
    mw.config.get('wgCanonicalSpecialPageName') === 'Revisiondelete' || mw.config.get('wgCanonicalSpecialPageName') === 'Block' ||
    mw.config.get('wgCanonicalSpecialPageName') === 'AbuseLog') {
    importScript('User:Amorymeltzer/csdcheck.js'); //[[User:Ale jrb/Scripts]], [[User:Amorymeltzer/csdcheck.js]]
}

//END MIXED

/*
  Some scripts need to be loaded only for certain actions
*/
/*ACTIONS*/
if (mw.config.get('wgAction') === 'history') {
    /*History*/
    // Make compare and revdel buttons act as links [[User:Amorymeltzer/historyButtonLinks.js]] (see [[phab:T244824]] and [[User:Mattflaschen/Compare link.js]]
	// Compare link
	$('input.historysubmit').on('click', function(e) {
		e.stopImmediatePropagation();
	});
	// Sysop links
	$('button.historysubmit').on('click', function(e) {
		e.stopImmediatePropagation();
	});

    window.histCombNoCollapse = true; //Don't collapse edits on load
    window.histCombMyBg = '#F0FFF0'; //background on your edits (light green)
    window.histCombTalk = 't'; //string to replace 'Talk'
    window.histCombContrib = 'c'; //string to replace 'contribs'
    window.histCombUndo = 'u'; //string to replace 'undo'
    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Alex_Smotrov/histcomb.js&oldid=920398942&action=raw&ctype=text/javascript'); //[[User:Alex Smotrov/histcomb.js]]

    //Shorten rollback to r; thanks to t; block to b
    //Adapted from [[User:Writ Keeper/Scripts/watchlistContribs.js]]
    //Set here rather than customize [[User:Alex Smotrov/histcomb.js]]
    $(function () {
	//$('[class^="mw-rollback-link"] a')[0].innerHTML = 'r' //By definition, there can be only one rollback on a history page
	$('[class^="mw-rollback-link"] a').each(function(index, link) {
	    link.innerHTML = link.innerHTML.replace(/rollback: (\d+) edit/, 'r$1');
	});
	$('[class^="mw-thanks-thank-link"]').each(function(index, link) {
	    link.innerHTML = "t";
	});
	$('[class^="mw-usertoollinks-block"]').each(function(index, link) {
	    link.innerHTML = "b";
	});
    });
} else if ((mw.config.get('wgAction') === 'edit') || (mw.config.get('wgAction') === 'submit')) {
    /*Edit and Submit*/
    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Js/ajaxPreview.js&oldid=916388391&action=raw&ctype=text/javascript'); //[[User:Js/ajaxPreview.js]], [[User:Js/ajaxPreview]]
    // code to execute after each preview update
    window.ajaxPreviewExec = function(previewArea) {
	//Enable popups
	if (window.setupTooltips) {
	    setupTooltips(previewArea);
	    previewArea.ranSetupTooltipsAlready = false;
	}
	//Sortable tables/collapsible elements
	mw.loader.using( [
	    'jquery.tablesorter',
	    'jquery.makeCollapsible'
	], function(){
	    $( 'table.sortable' ).tablesorter();
	    $( '#wikiPreview .collapsible' ).makeCollapsible();
	} );
    };
    //Last one has precedence
    //var ajaxPreviewPos = 'left'; //buttons on the left
    var ajaxPreviewPos = 'bottom'; //buttons on the bottom, old with >
    /*Putting previews on the bottom precludes these options*/
    //var ajaxPreviewKey = ''; //"preview" button accesskey
    //var ajaxDiffKey = ''; //"changes" button accesskey
    //var ajaxPreviewButton = 'Ω'; //"preview" button text
    //var ajaxDiffButton = 'Δ'; //"changes" button text

    mw.loader.load('//he.wikipedia.org/w/load.php?modules=ext.gadget.autocomplete'); // [[User:ערן/autocomplete.js]], [[he:MediaWiki:Gadget-autocomplete.js]] Doesn't work with tab or beta syntax highlighter
    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Mabdul/saveandedit.js&oldid=666699128&action=raw&ctype=text/javascript'); //[[User:Mabdul/saveandedit.js]]
    mw.loader.load('//tools-static.wmflabs.org/meta/scripts/pathoschild.templatescript.js'); //[[meta:TemplateScript]] Successor to [[meta:User:Pathoschild/Scripts/Regex menu framework]]

    //More succinct text when editing
    $("label[for='wpMinoredit']").html('Minor');
    $("label[for='wpWatchthis']").html('Watch');

    //Don't watch super active projectspace pages
    //AIV, RFPP, UAA, ANI, Sandbox
    $(function () {
	if (mw.config.get('wgNamespaceNumber') === 4 && ['Administrator intervention against vandalism', 'Requests for page protection', 'Usernames for administrator attention', 'Administrator intervention against vandalism/TB2', 'Usernames for administrator attention/Bot', "Administrators' noticeboard/Incidents", 'Sandbox'].indexOf(mw.config.get('wgTitle')) !== -1) {
	    $('#wpWatch').prop('checked', false);
	}
    });
} else if (mw.config.get('wgAction') === 'purge' || mw.config.get('wgAction') === 'watch' || mw.config.get('wgAction') === 'unwatch') {
    /*Purge, (un)Watch*/
    /* Automate purge/watch/unwatch confirmation dialog */
    var qAction = mw.config.get('wgAction');
    $('form[action*="action='+qAction+'"]').submit();
}//END ACTIONS


//Do stuff once the page has finally loaded.  Most of these are
//shortening some personal tool names.  Twinkle requires this,
//but the built-in elements don't, I think because the TW code is
//loaded too late.  This way, they all change at the same time
//Also move a bunch of crap around and the like
//Doesn't always work
function loadFunct(){
    //Move portlets around, from [[User:MZMcBride/tabaway.js]] and Splarka
    function movePortletLi(liid,portletid,clone) {
	var li = document.getElementById(liid);
	var portlet = document.getElementById(portletid);
	if(!li || !portlet) return;
	var ul = portlet.getElementsByTagName('ul')[0];
	var newli = li.cloneNode(true);
	ul.appendChild(newli);
	if(!clone) li.parentNode.removeChild(li);
    }

    $('li#pt-userpage a').text('Amory');
    // $('li#pt-preferences a').text('prefs');
    // $('li#pt-mycontris a').text('contribs');
    $('li#t-log a').text('User log');
    $('li#t-userrights a').text('User rights');
    $('li#ca-unprotect a').text('uprotect');
    $('li#ca-undelete a').text('udelete');
    $('li#ca-unwatch a').text('uwatch');
    $('li#ca-AutoEd a').text('Auto Ed');
    $('li#tw-unlink a').text('unlnk');
    $('li#tw-batch a').text('dbatch');
    $('li#tw-pbatch a').text('pbatch');
    $('li#tw-batch-undel a').text('ubatch');

    $('li#ca-disamassist-page a').text('Disam page');
    $('li#ca-disamassist-main a').text('Disam primary');
    $('li#ca-disamassist-same a').text('Disam dab');
    $($('.blockmenu a')[0]).text('easyblock');

    //$('#pt-logs').after($('#t-log'));

    movePortletLi('t-specialpages', 'p-navigation');
    movePortletLi('n-recentchanges', 'p-navigation');
    movePortletLi('n-randompage', 'p-navigation');
    movePortletLi('n-randomredirect', 'p-navigation');
    movePortletLi('n-randomdisam', 'p-navigation');

    movePortletLi('t-word-count', 'p-edit');
    movePortletLi('t-peer', 'p-edit');
    //movePortletLi('t-wdlh-check', 'p-edit');
    movePortletLi('t-findlink', 'p-edit');
    movePortletLi('ca-findduplicatelinks', 'p-edit');
    movePortletLi('pt-dabfix', 'p-edit');
    movePortletLi('pt-dabsolve', 'p-edit');
    //movePortletLi('ca-disamassist-page', 'p-edit');
    //movePortletLi('ca-disamassist-main', 'p-edit');
    //movePortletLi('ca-disamassist-same', 'p-edit');
    movePortletLi('t-checklinks', 'p-edit');
    movePortletLi('t-citationbot', 'p-edit');
    movePortletLi('t-reflinks', 'p-edit');
    movePortletLi('t-iabot', 'p-edit');
    movePortletLi('citoid', 'p-edit');
    movePortletLi('t-edit-refs', 'p-edit');
    movePortletLi('ca-formatcitations', 'p-edit');
    movePortletLi('t-addmetric', 'p-edit');
    movePortletLi('ca-AutoEd', 'p-edit');

    var rece = $('#n-recentchanges');
    rece.html(rece.html() + ' <span style="font-size: x-small"><a href="/w/index.php?title=Special:RecentChanges&hideliu=1">(a)</a></span>');

    var rando = $('#n-randompage');
    rando.html(rando.html() + ' <span style="font-size: x-small"><a href="/w/index.php?title=Special:Random&action=edit">(e)</a></span>');
}

window.onload = loadFunct();


//Check Check 1-2 1-2
importScript('User:Amorymeltzer/test.js'); //[[User:Amorymeltzer/test.js]]


/*Interesting, but not now
  importScript('User:Enterprisey/talk-tab-count.js'); //[[User:Enterprisey/talk-tab-count.js]]
  importScript('User:Equazcion/SafetyEdit.js'); //[[User:Equazcion/SafetyEdit.js]]
  var sysopSafety = true;
  importScript('User:Bradv/splitpreview.js'); //[[User:Bradv/splitpreview.js]] Preview on the side, not top
  importScript('User:Enterprisey/undo-last-edit.js'); //[[User:Enterprisey/undo-last-edit.js]]
  importScript('User:Writ Keeper/Scripts/watchlistContribs.js'); //[[User:Writ Keeper/Scripts/watchlistContribs.js]]
  importScript('User:Kangaroopower/MRollback.js'); //[[User:Kangaroopower/MRollback.js]] Good menu though!
  mw.loader.load('//tools-static.wmflabs.org/meta/scripts/pathoschild.ajaxsysop.js'); //[[m:Ajax sysop]]
  importScript('User:Joshua Scott/Scripts/pendingchanges.js'); //[[User:Joshua Scott/Scripts/pendingchanges.js]]
  importScript('User:Bellezzasolo/Scripts/arb.js'); //[[User:Bellezzasolo/Scripts/arb.js]] Discretionary sanctions
  [[meta:User:Krinkle/Scripts/CVNSimpleOverlay]] //Too similar to mark blocked?  Maybe try on a vandal not yet blocked
  [[meta:User:Krinkle/Tools/WhatLeavesHere]]
  [[meta:User:Krinkle/Tools/Real-Time_Recent_Changes]]; also a local gadget
  [[Wikipedia:WPCleaner]]
  importScript('User:Yair rand/HistoryView.js'); //[[User:Yair rand/HistoryView.js]] Visual hist with section headers, autodiffs.  Maybe edit for toggle?
  importScript('User:BethNaught/exportUserOptions.js'); //[[User:BethNaught/exportUserOptions.js]
  importScript('User:PrimeHunter/Source links.js'); //[[User:PrimeHunter/Source links.js]]
  importScript('User:Joeytje50/JWB.js/load.js'); [[User:Joeytje50/JWB.js/load.js]], [[User:Joeytje50/JWB.js]], [[User:Joeytje50/JWB.js]], [[Wikipedia:AutoWikiBrowser/Script]]
  importScript('User:Kangaroopower/ajaxMove.js'); //[[User:Kangaroopower/ajaxMove.js]]
  importScript('User:Evad37/TextDiff.js'); //[[User:Evad37/TextDiff.js]]
  importScript('User:Pyrospirit/metadata/projectbanners.js'); //Busted with [[Wikipedia:Metadata gadget]] gadget at the moment [[User:Pyrospirit/metadata/projectbanners.js]]
  importScript('User:Nihiltres/assesslinks.js'); //[[User:Nihiltres/assesslinks.js]] Color links on a page

*/

/*Not working, seem fixable
  importScript('User:Paranomia/simplevote.js'); //[[User:Paranomia/simplevote.js]] Seems fixable for modern, maybe like XfD closer
  importScript('User:Dipankan001/external link.js'); //[[User:Dipankan001/external link.js]]
  importScript('User:Gary/namespace redirect.js'); //[[User:Gary/namespace redirect.js]]
  importScript('User:Dr pda/prosesize.js'); //[[User:Dr pda/prosesize.js]]
  importScript('User:Barticus88/WhatLinksHere.js'); //[[User:Barticus88/WhatLinksHere.js]]
*/

/*Reference
  [[Wikipedia:User_scripts/List]] //See also Guide
  [[User:Facenapalm/Most_imported_scripts]]
  [[User:Haza-w/Drop-down_menus]] //[[m:MoreMenu]]
  [[User:Cyberpower678/API]]
  [[mw:Manual:Interface/JavaScript]
  [[mw:ResourceLoader/Core_modules#jquery.makeCollapsible]]
  [[mw:ResourceLoader/Migration_guide_(users)]]
  [[test:Test_suite_for_mw-collapsible]]
*/
