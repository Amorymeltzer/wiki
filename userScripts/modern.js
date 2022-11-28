/* jshint maxerr:999 */
/*
  This page is designed to only load items on specific pages
  It makes use of an irresponsible number of if-else statements
  The main loop covers whether a page is Special or not
  The secondary loop covers page actions
  There are some exceptions afterward for mixed situations
  But first, load scripts wanted everywhere
*/

// Blah
var cfg = mw.config.get();

/* Everywhere */
// Config for [[Wikipedia:Tools/Navigation popups]], [[MediaWiki:Gadget-popups.js]], [[MediaWiki:Gadget-navpop.css]]
window.popupMaxWidth = 500; // Default is 350
window.popupAdminLinks = true;
window.popupPreviewFirstParOnly = false; // Default is true
window.popupMaxPreviewSentences = 6; // Default is 5
window.popupMaxPreviewCharacters = 800; // Default is 600
window.popupPreviewKillTemplates = false; // Default is true
window.popupPreviewRawTemplates = false; // Default is true
window.popupOnlyArticleLinks = false; // Default is true
window.popupFixDabs = true; // Default is false
window.popupRedlinkRemoval = true; // Default is false
window.popupEditCounterTool = 'custom'; // Default is supercount
window.popupEditCounterUrl = 'https://xtools.wmflabs.org/ec/en.wikipedia.org/$1';
window.popupHistoryPreviewLimit = 35; // Default is 25
window.popupContribsPreviewLimit = 35; // Default is 25
window.popupThumbAction = 'sizetoggle'; // Default is 'imagepage'
window.popupSetupMenu = false;  // Default is true
window.popupLastEditLink = false; // Default is true

// Config for [[Wikipedia:Comments in Local Time]], [[User:Gary/comments in local time.js]], [[MediaWiki:Gadget-CommentsInLocalTime.js]]
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Gary/comments_in_local_time.js&oldid=1103519446&action=raw&ctype=text/javascript');
window.LocalComments = {
	dateDifference: true,
	//        dateFormat: 'dmy',
	//        timeFirst: true,
	twentyFourHours: true,
	//        dayOfWeek: true,
	//        dropMonths: 0,
	dropDays: 62
};

// Might reload the page
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/unhide.js&action=raw&ctype=text/javascript'); // [[User:Amorymeltzer/unhide.js]]
// [[MediaWiki:Gadget-markblocked.js]] originally installed via [[User:NuclearWarfare/Mark-blocked script.js]], now loaded via prefs
// mw.loader.load('//en.wikipedia.org/w/index.php?title=Wikipedia:WikiProject_User_scripts/Scripts/Six_tabs&oldid=1005393196&action=raw&ctype=text/javascript'); // placeholder
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/seventabs.js&action=raw&ctype=text/javascript'); // [[User:Amorymeltzer/seventabs.js]], a much improved version of [[Wikipedia:WikiProject User scripts/Scripts/Six tabs]]
// window.ADMINHIGHLIGHT_EXTLINKS = true;
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/crathighlighter.js&action=raw&ctype=text/javascript'); // [[User:Bellezzasolo/Scripts/adminhighlighter.js]], [[User:Ais523/adminrights.js]], [[User:Amalthea/userhighlighter.js]], [[User:Amorymeltzer/crathighlighter.js]]
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Lenore/autolink.js&oldid=945652161&action=raw&ctype=text/javascript'); // [[User:Lenore/autolink.js]], [[User:Lenore/autolink]] Try to display templates, etc in comments everywhere
// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/nulledit.js&action=raw&ctype=text/javascript'); //[[User:MZMcBride/nulledit.js]], [[User:Splarka/nulledit.js]], [[User:Amorymeltzer/nulledit.js]]
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/pinfo.js&action=raw&ctype=text/javascript'); // [[User:Smith609/toolbox.js]], [[User:קיפודנחש/viewstats.js]], [[User:Amorymeltzer/pinfo.js]]
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/pagemods.js&action=raw&ctype=text/javascript'); // Mix of namespaces, actions, etc. [[User:Amorymeltzer/pagemods.js]]
/* Should probably make these next two more specific */
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/more-listing-items.js&oldid=882933273&action=raw&ctype=text/javascript'); // [[User:Enterprisey/more-listing-items.js]]
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Suffusion_of_Yellow/filter-highlighter.js&oldid=930753959&action=raw&ctype=text/javascript'); // [[User:Suffusion_of_Yellow/filter-highlighter.js]]

// Quick access for quick access
$(function () {
	mw.util.addPortletLink('p-personal', '//en.wikipedia.org/w/index.php?title=Special:Log&user=Amorymeltzer', 'My logs', 'pt-mylogs', 'Your logged actions', '', '#pt-logout');
	mw.util.addPortletLink('p-personal', mw.util.getUrl('User:Amorymeltzer/mass'), 'Mass', 'p-mass', 'MASS'); // [[User:Amorymeltzer/mass]]
	mw.util.addPortletLink('p-personal', mw.util.getUrl('User:Amorymeltzer/perm'), 'Perm', 'p-perm', 'PERM'); // [[User:Amorymeltzer/perm]]
	mw.util.addPortletLink('p-personal', '//en.wikipedia.org/wiki/User:Amorymeltzer/dash?action=purge', 'Dash', 'p-dash', 'Dashboard');
	mw.util.addPortletLink('p-personal', '//tools.wmflabs.org/copypatrol/en', 'Copy', 'p-copypatrol', 'Copyright patrol');
	mw.util.addPortletLink('p-personal', '//en.wikipedia.org/wiki/Wikipedia:Usernames_for_administrator_attention?action=purge', 'UAA', 'p-uaa', 'UAA');
	mw.util.addPortletLink('p-personal', '//en.wikipedia.org/wiki/Wikipedia:Administrator_intervention_against_vandalism?action=purge', 'AIV', 'p-aiv', 'AIV');
	mw.util.addPortletLink('p-personal', '//en.wikipedia.org/wiki/Wikipedia:Requests_for_page_protection?action=purge', 'RFPP', 'p-rfpp', 'RFPP');
	mw.util.addPortletLink('p-personal', '//en.wikipedia.org/wiki/User:Amorymeltzer/Subpage_of_plus_one_efficiency?action=purge', 'plus one', 'p-plusone', 'Efficiency FTW', '-');
	mw.util.addPortletLink('p-navigation', mw.util.getUrl('Special:RandomRedirect'), 'Random redirect', 'n-randomredirect', 'Load a random redirect', 'a');
	mw.util.addPortletLink('p-navigation', mw.util.getUrl('Special:RandomInCategory/All article disambiguation pages'), 'Random disam', 'n-randomdisam', 'Random disambiguation page', 'b');
});

/*
  Is the page Special or not, and if so, choose between the various sub-options
*/
/* Special */
if (cfg.wgCanonicalNamespace === 'Special') {
	switch (cfg.wgCanonicalSpecialPageName) {
		case 'Contributions':
			if ($('.mw-contributions-list').length) { // Save some space
				var paraGone = $('.mw-contributions-list')[0].previousSibling; // Remove <p> tag revision date nav
				$(paraGone).replaceWith(paraGone.childNodes);
			}

			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Markhurd/hidetopcontrib.js&oldid=934625836&action=raw&ctype=text/javascript'); // [[User:Markhurd/hidetopcontrib.js]]
			window.userHideAllSubsequent = true;
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Writ_Keeper/Scripts/massRollback.js&oldid=1078677422&action=raw&ctype=text/javascript'); // [[User:Writ Keeper/Scripts/massRollback.js]]

			// Create button to turn on [[User:Writ Keeper/Scripts/massRevdel.js]]
			// Script is immensely helpful, but the individual links and OS bolding are as well
			$('.mw-contributions-list').before("<span id=toggle_massrevdel class='toggle_massrevdel' style='font-size:85%;'>" +
						"<span style='margin-left:0.4em;'>(<a style='cursor:pointer;' title='Mass RevDel' class='mass_revdel_on'>Mass RevDel</a>)</span>" +
						'</span>');
			$(document).on('click', '.mass_revdel_on', function() {
				mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Writ_Keeper/Scripts/massRevdel.js&oldid=1078676732&action=raw&ctype=text/javascript'); // [[User:Writ Keeper/Scripts/massRevdel.js]]
				$('#toggle_massrevdel').remove();
				// Tighten/shorten massRevdel stuff
				mw.loader.using(['mediawiki.util'], function() {
					mw.util.addCSS('#revdelCP {margin-left: 0.4em;}');
				});
				$(document).on('click', '#revdelCP', function() {
					$('#revdelLabel').text('RevDel >'); // Would prefer this to begin with but so be it
					$('#revdelSelectAll').val('All');
					$('#revdelSelectNone').val('None');
					$('#revdelSubmit').val('RevDel');
					$('#oversightSubmit').val('Oversight');
				});
			});

			// Will run once on load, then also after each endlesscontribs load
			var shortenText = function() {
				// Shorten revdel; change rollback to r; current to top
				// Adapted from [[User:Writ Keeper/Scripts/watchlistContribs.js]]
				$('[class^="mw-uctop"]').each(function(index, link) {
					link.innerHTML = 'top';
				});
				$('[class^="mw-rollback-link"] a').each(function(index, link) {
					link.innerHTML = link.innerHTML.replace(/rollback: (\d+) edit/, 'roll$1');
				});
				$('[class^="mw-revdelundel-link"] a').each(function(index, link) {
					link.innerHTML = 'RevDel';
				});
			};
			$(shortenText());

			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Bradv/endlesscontribs.js&oldid=1090160359&action=raw&ctype=text/javascript'); //[[User:Bradv/endlesscontribs.js]], [[User:Bradv/endlesscontribs]]
			// Testing post-load callback
			// Will be added to below
			window.endlesscontribsExec = shortenText;
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/endlesscontribs.js&action=raw&ctype=text/javascript'); // [[User:Amorymeltzer/endlesscontribs.js]]
			break;
		case 'Watchlist':
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Equazcion/LagToMinutes.js&oldid=788726414&action=raw&ctype=text/javascript'); // [[User:Equazcion/LagToMinutes.js]] Display lag in minutes on watchlist
			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Equazcion/ReverseMarked.js&oldid=1002585662&action=raw&ctype=text/javascript'); // placeholder
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/ReverseMarked.js&action=raw&ctype=text/javascript'); // [[User:Equazcion/ReverseMarked.js]] Hide visited pages on watchlist [[User:Amorymeltzer/ReverseMarked.js]]
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Evad37/Thanky.js&oldid=928009085&action=raw&ctype=text/javascript'); // [[User:Evad37/Thanky.js]], [[User:Evad37/Thanky]]
			break;
		case 'Log':
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/logSwap.js&action=raw&ctype=text/javascript'); // [[User:Amorymeltzer/logSwap.js]] initially inspired by [[User:PleaseStand/common.js]]
			break;
		case 'Whatlinkshere':
			// Add history and delete links
			// mw.loader.load('//meta.wikimedia.org/w/index.php?title=User:He7d3r/Tools/AddActionLinks.js&oldid=12463106&action=raw&ctype=text/javascript'); // placeholder
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/wlhActionLinks.js&action=raw&ctype=text/javascript'); // [[meta:User:He7d3r/Tools/AddActionLinks.js]], [[User:Amorymeltzer/wlhActionLinks.js]]
			// Quick count of transclusions and links
			mw.loader.load('//www.wikidata.org/w/index.php?title=MediaWiki:Linkscount.js&action=raw&ctype=text/javascript'); // [[wikidata:MediaWiki:Linkscount.js]]
			break;
		case 'Block':
			// Automatically watch user talk pages when blocking
			$('input[name=wpWatch]').prop('checked', true);
			break;
		case 'Search':
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Mr._Stradivarius/gadgets/SearchEditLink.js&oldid=684105738&action=raw&ctype=text/javascript'); // [[User:Mr. Stradivarius/gadgets/SearchEditLink.js]]
			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:PrimeHunter/Search_sort.js&oldid=1111895973&action=raw&ctype=text/javascript'); // placeholder
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/Search_sort.js&action=raw&ctype=text/javascript'); // [[User:Amorymeltzer/Search_sort.js]], [[User:PrimeHunter/Search_sort.js]]
			break;
		case 'AbuseLog':
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/osal.js&action=raw&ctype=text/javascript'); // [[User:Amorymeltzer/osal.js]]
			break;
		default:
			/* Masses [[UserAmorymeltzer/mass]] */
			switch (cfg.wgPageName) {
				case 'Special:Massedit':
					mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Timotheus_Canens/massedit.js&oldid=1050835632&action=raw&ctype=text/javascript'); // [[User:Timotheus Canens/massedit.js]]
					break;
				case 'Special:Massdelete':
					mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Animum/massdelete.js&oldid=1058090486&action=raw&ctype=text/javascript'); // [[User:Animum/massdelete.js]]
					break;
				case 'Special:Massrestore':
					mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Timotheus_Canens/massrestore.js&oldid=1058090468&action=raw&ctype=text/javascript'); // [[User:Timotheus Canens/massrestore.js]]
					break;
				case 'Special:Massblock':
					mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Timotheus_Canens/massblock.js&oldid=1058090461&action=raw&ctype=text/javascript'); // [[User:Timotheus Canens/massblock.js]]
					break;
				case 'Special:MassUnblock':
					mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Timotheus_Canens/massunblock.js&oldid=1058090451&action=raw&ctype=text/javascript'); // [[User:X!/massunblock.js]], [[User:Timotheus Canens/massunblock.js]]
					break;
				case 'Special:Massprotect':
					mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Timotheus_Canens/massprotect.js&oldid=1070973311&action=raw&ctype=text/javascript'); // [[User:Timotheus Canens/massprotect.js]]
					break;
				case 'Special:Massmove':
					mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Plastikspork/massmove.js&oldid=1058090434&action=raw&ctype=text/javascript'); // [[User:Plastikspork/massmove.js]]
					break;
				default:
					break;
			}
	}
} else {
	/*
	  Load everything that shouldn't be on a special page
	  This will eventually devolve to Mainspace or not
	*/
	/* Not Special */
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Ale_jrb/Scripts/csdhelper.js&oldid=1095684958&action=raw&ctype=text/javascript'); // [[User:Ale jrb/Scripts]], [[User:Ale jrb/Scripts/csdhelper.js]]
	window.notifyByDefaultDec = true; // default is true
	// window.notifyByDefaultDel = true; //default is false
	window.notifyByDefaultPrd = true; // default is true
	window.notifyByDefaultNew = false; // default is true
	// window.csdhDoRedirect = false; //default is true
	window.redirectAfterDel = '#';
	// window.redirectAfterDel = 'https://en.wikipedia.org/w/index.php?title=Special:Log&user=Amorymeltzer';
	window.logOnDecline = true;
	window.logOnDeclinePath = 'User:Amorymeltzer/DeclinedCSDs';
	window.myDeclineSummary = 'Declining speedy (%CRITERION%) — %REASON%';
	window.myDeclineSummarySpecial = 'Declining speedy — %REASON%';
	window.overwriteDeclineReasons = true;
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/CSDHreasons.js&action=raw&ctype=text/javascript'); // [[User:Amorymeltzer/CSDHreasons.js]] Custom decline reasons, inspired by [[User:SoWhy/csdreasons.js]]

	// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:BethNaught/hideSectionDesktop.js&oldid=1002949275&action=raw&ctype=text/javascript'); // placeholder
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/hideSectionDesktop.js&action=raw&ctype=text/javascript'); // [[User:BethNaught/hideSectionDesktop.js]], [[User:Amorymeltzer/hideSectionDesktop.js]]
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:The_Earwig/permalink.js&oldid=1074774463&action=raw&ctype=text/javascript'); // [[User:The Earwig/permalink.js]]

	// Diffs
	mw.loader.using(['mediawiki.util'], function() {
		if (mw.util.getParamValue('diff') || mw.util.getParamValue('oldid')) {
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/link-deleted-revs.js&oldid=954758921&action=raw&ctype=text/javascript'); // [[User:Enterprisey/link-deleted-revs.js]], [[User:Enterprisey/link-deleted-revs]]
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/diff-context.js&oldid=980040434&action=raw&ctype=text/javascript'); // [[User:Enterprisey/diff-context.js]], [[User:Enterprisey/diff-context]]
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/offset-history-link.js&oldid=1060844701&action=raw&ctype=text/javascript'); // [[User:Enterprisey/offset-history-link.js]], [[User:Enterprisey/offset-history-link]]
			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/diff-permalink.js&oldid=1050007234&action=raw&ctype=text/javascript'); // placeholder
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/diff-permalink.js&action=raw&ctype=text/javascript'); // [[User:Enterprisey/diff-permalink.js]]
			mw.loader.load('//meta.wikimedia.org/w/index.php?title=User:Jon_Harald_Søby/diffedit.js&oldid=22620102&action=raw&ctype=text/javascript' ); // [[meta:User:Jon_Harald_Søby/diffedit.js]], [[meta:User:Jon_Harald_Søby/diffedit]]
		}
	});

	// Shorten revdel
	// Should probably combine this with the identical one for Special:Contributions
	$(function () {
		if (cfg.wgRevisionId) {
			$('[class^="mw-revdelundel-link"] a').each(function(index, link) {
				link.innerHTML = 'RevDel';
			});
		}
	});

	/*
	  Most things aren't needed on articles, so define articles first
	  That being said, some things are articles and elsewhere
	*/
	/* Articles and Drafts */
	if ((cfg.wgNamespaceNumber === 0) || (cfg.wgNamespaceNumber === 118)) {
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:The_Earwig/copyvios.js&oldid=1013538065&action=raw&ctype=text/javascript'); // [[User:The Earwig/copyvios.js]]
	}

	/* Articles and Talk */
	// Only on articles and talk
	if ((cfg.wgNamespaceNumber === 0) || (cfg.wgNamespaceNumber === 1)) {
		/* Edit/create redirects with [[User:Wugapodes/Capricorn]] ([[User:Wugapodes/Capricorn.js]])
		 * [[User:Sam Sailor/Scripts/Sagittarius+]] ([[User:Sam Sailor/Scripts/Sagittarius+.js]])
		 * [[User:Kephir/gadgets/sagittarius]] ([[User:Kephir/gadgets/sagittarius.js]]) */
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Wugapodes/Capricorn.js&oldid=1013955969&action=raw&ctype=text/javascript'); /* --skipUpdate-- */

		// [[User:Evad37/rater.js]], [[User:Evad37/rater/app.js]], [[User:Kephir/gadgets/rater.js]]
		// Loading here rather than via rater.js to get specific version
		mw.loader.using([
			'mediawiki.util', 'mediawiki.api', 'mediawiki.Title',
			'oojs-ui-core', 'oojs-ui-widgets', 'oojs-ui-windows',
			'oojs-ui.styles.icons-content', 'oojs-ui.styles.icons-interactions',
			'oojs-ui.styles.icons-moderation', 'oojs-ui.styles.icons-editing-core',
			'mediawiki.widgets', 'mediawiki.widgets.NamespacesMultiselectWidget'
		], function() {
			// Do not operate on non-existent pages or their talk pages
			if (!$('li.new[id|=ca-nstab]').length) {
				mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Evad37/rater/app.js&oldid=1062790269&action=raw&ctype=text/javascript');
			}
		});
	}

	/* Articles */
	if (cfg.wgNamespaceNumber === 0) {
		// [[Wikipedia:HotCat]], [[MediaWiki:Gadget-HotCat.js]], [[commons:Help:Gadget-HotCat]]
		// Installed here to be only in mainspace
		window.hotcat_no_autocommit = true;
		window.hotcat_del_needs_diff = true;
		mw.loader.load('ext.gadget.HotCat');

		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Nardog/PlayAudioNow.js&oldid=1042500700&action=raw&ctype=text/javascript'); // [[User:Nardog/PlayAudioNow]], [[User:Nardog/PlayAudioNow.js]]

		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/pedit.js&action=raw&ctype=text/javascript'); // [[User:Smith609/toolbox.js]], [[User:Amorymeltzer/pedit.js]]
		/* Backlinks for pedit:
		   [[User:Lourdes/Backlinks.js]], [[m:User:Zhaofeng_Li/Reflinks.js]]], [[User:Lourdes/Backlinks.js]]
		   [[User:Edward/Find link]], [[User:Evad37/duplinks-alt]], [[User:Ucucha/duplinks.js]]
		   [[User:Qwertyytrewqqwerty/DisamAssist.js]], [[MediaWiki:Gadget-citations.js]], [[Wikipedia:AutoEd/complete.js]]
		   [[User:GregU/dashes.js]], [[User:Salix_alba/Citoid.js]], [[User:Ohconfucius/script/formatgeneral.js]]
		   [[User:Ohconfucius/script/Common Terms.js]], [[User:Dr_pda/editrefs.js]], [[User:TheJJJunk/ARA.js]]
		   [[User:Meteor sandwich yum/Tidy citations.js]], [[User:Cameltrader/Advisor.js]], [[User:PC-XT/Advisor.js]]
		   [[MediaWiki:Gadget-ProveIt.js]], [[WP:ProveIt]], [[m:User:TMg/autoFormatter]]
		*/
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Gary/smaller_templates.js&oldid=596443737&action=raw&ctype=text/javascript'); // [[User:Gary/smaller templates.js]]
		// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Sam_Sailor/Scripts/WRStitle.js&oldid=844962945&action=raw&ctype=text/javascript'); // placeholder
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/WRStitle.js&action=raw&ctype=text/javascript'); // [[User:Sam Sailor/Scripts/WRStitle.js]] Link to reference search [[WP:WRS] [[User:Amorymeltzer/WRStitle.js]]
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Gary/subjects_age_from_year.js&oldid=1003565926&action=raw&ctype=text/javascript'); // [[User:Gary/subjects age from year.js]]
		mw.loader.load('ext.gadget.XTools-ArticleInfo'); // [[MediaWiki:Gadget-XTools-ArticleInfo.js]], [[mw:XTools/ArticleInfo.js]], [[User:Amorymeltzer/articleinfo-gadget.js]]
	} else { // END ARTICLES
		/*
		  Most scripts aren't needed in mainspace, so load them individually
		  Some will be any nonzero namespace, some in specific categories (WP, etc.)
		*/

		/* Anywhere but articles */

		// YAAFCH originally from [[User:Timotheus Canens/afchelper4.js]]
		// Manually installed rather than via gadget to keep off User pages
		// [[User:Enterprisey/afch-master.js]], [[User:Enterprisey/afch-master.js/core.js]
		if ($.inArray(cfg.wgCanonicalNamespace, ['Project', 'Project_talk', 'Draft']) >= 0) {
			mw.loader.load('ext.gadget.afchelper'); // [[MediaWiki:Gadget-afchelper.js]]
		}

		if (cfg.wgNamespaceNumber === 4) {
			/* Wikipedia project space, not talk */
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/strike-archived.js&oldid=977679272&action=raw&ctype=text/javascript'); // [[User:Enterprisey/strike-archived.js]], [[User:Enterprisey/strike-archived]]
			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Splarka/oldafd.js&oldid=1074308067&action=raw&ctype=text/javascript'); // placeholder
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/oldafd.js&action=raw&ctype=text/javascript'); // [[User:Splarka/oldafd.js]], [[User:Amorymeltzer/oldafd.js]]
			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:MusikAnimal/responseHelper.js&oldid=1115769302&action=raw&ctype=text/javascript'); // placeholder
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/responseHelper.js&action=raw&ctype=text/javascript'); // [[User:MusikAnimal/responseHelper.js]], [[User:Amorymeltzer/responseHelper.js]]
			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:MusikAnimal/userRightsManager.js&oldid=1084627708&action=raw&ctype=text/javascript'); // placeholder
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/userRightsManager.js&action=raw&ctype=text/javascript'); // [[User:MusikAnimal/userRightsManager.js]], [[User:Amorymeltzer/userRightsManager.js]]
			// Not at the moment, needs updating for restructured layout
			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/qrfpp.js&action=raw&ctype=text/javascript'); // [[User:Amorymeltzer/qrfpp.js]] from [[User:Evad37/RPPhelper.js]] and [[User:MusikAnimal/userRightsManager.js]]

			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Timotheus Canens/spihelper.js&action=raw&ctype=text/javascript'); [[User:Timotheus Canens/spihelper.js]] Not clerking atm. Duplicated in responseHelper?
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/delsort.js&oldid=1082743865&action=raw&ctype=text/javascript'); // [[User:Enterprisey/delsort.js]]

			// [[MediaWiki:Gadget-XFDcloser.js]], [[User:Evad37/XFDcloser/v3.js]], [[User:Evad37/XFDcloser.js]], [[User:Mr.Z-man/closeAFD.js]]
			// Originally installed here to keep off certain pages but now installed via gadget
			// mw.loader.load('ext.gadget.XFDcloser');
			/* Only for [[WP:AFC/R]] */
			if (cfg.wgPageName === 'Wikipedia:Articles_for_creation/Redirects') {
				mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/AFCRHS.js&oldid=1053491363&action=raw&ctype=text/javascript'); // [[User:Enterprisey/AFCRHS]], [[User:EnterpriseyBot/AFCRHS.js]]
			} else if (cfg.wgPageName === 'Wikipedia:AutoWikiBrowser/Script') {
				// JWB only active on [[Wikipedia:AutoWikiBrowser/Script]]
				mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Joeytje50/JWB.js&oldid=1006387480&action=raw&ctype=text/javascript'); // [[User:Joeytje50/JWB]], [[User:Joeytje50/JWB.js]] /* --skipUpdate-- */
			}
		} else if (cfg.wgNamespaceNumber === 14) {
			/* Categories */
			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Equazcion/CatListMainTalkLinks.js&oldid=778892707&action=raw&ctype=text/javascript'); // placeholder
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/CatListMainTalkLinks.js&action=raw&ctype=text/javascript'); // [[User:Equazcion/CatListMainTalkLinks.js]] Display main/talk/hist links for pages in categories [[User:Amorymeltzer/CatListMainTalkLinks.js]]
		} else if (cfg.wgNamespaceNumber === 6) {
			/* Files */
			// TinEye link, from [[meta:User:Krinkle/Scripts/TinEye]], [[File:Krinkle_TinEye.js]], [[commons:MediaWiki:Gadget-Tineye.js]], [[commons:MediaWiki:Gadget-Tineye]]
			var imgs = $('#file img');
			if (imgs.length) {
				mw.util.addPortletLink('p-cactions', 'http://tineye.com/search?url=' + encodeURIComponent(imgs[0].src), 'TinEye', 'ca-tineye');
			}
		} else if (cfg.wgNamespaceNumber === 8) {
			/* MediaWiki, but really just [[MediaWiki:Gadgets-definition]] */
			if (cfg.wgPageName === 'MediaWiki:Gadgets-definition') {
				// Link and prettify gadgets [[User:Erutuon/scripts/gadgets-definition.js]], [[wikt:User:Erutuon/scripts/gadgets-definition.js]]
				mw.loader.load('//en.wiktionary.org/w/index.php?title=User:Erutuon/scripts/gadgets-definition.js&oldid=62389523&action=raw&ctype=text/javascript');
			}
		}// END else if LOOP but remain in not articles

		/* WP and all talks */
		if ((cfg.wgNamespaceNumber === 4) || (cfg.wgNamespaceNumber % 2 === 1)) {
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Pythoncoder/Scripts/voteSymbols.js&oldid=1107036835&action=raw&ctype=text/javascript'); // [[User:Ais523/votesymbols.js]], [[User:Pythoncoder/Scripts/voteSymbols.js]], [[User:Pythoncoder/Scripts/voteSymbols]]
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Evad37/OneClickArchiver.js&oldid=953990693&action=raw&ctype=text/javascript'); // [[User:Evad37/OneClickArchiver.js]], [[User:Technical 13/Scripts/OneClickArchiver]], [[User:Technical 13/Scripts/OneClickArchiver.js]]
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Evad37/TimestampDiffs.js&oldid=1033878262&action=raw&ctype=text/javascript'); // [[User:Evad37/TimestampDiffs.js]], [[User:Evad37/TimestampDiffs]]
			/* All talks */
			if (cfg.wgNamespaceNumber !== '4') {
				mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Jackmcbarn/editProtectedHelper.js&oldid=1097991013&action=raw&ctype=text/javascript'); // [[User:Jackmcbarn/editProtectedHelper.js]]
				/* User talks */
				if (cfg.wgNamespaceNumber === '3') {
					mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/unblock-review.js&oldid=1073685522&action=raw&ctype=text/javascript'); // [[User:Enterprisey/unblock-review.js]]
				}
			}
		}
	}// END not articles

}// END ENTIRE LOOP (not special, etc.)



/*
  A number of items need to load for some special pages and certain actions
  Including them in the above would make it too complex
  Or would require loading them multiple times in different places
  Instead, load them here in overly complex, inefficient, and redundant if statements
  Basically, places where rollback/diffs exist, a username exists, or places with wikilinks in dropdown menus
*/
/* MIXED */
if (cfg.wgAction === 'history' || cfg.wgCanonicalSpecialPageName === 'Contributions'
    || cfg.wgCanonicalSpecialPageName === 'Watchlist' || cfg.wgCanonicalSpecialPageName === 'Recentchanges') {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Writ_Keeper/rollbackSummary.js&oldid=777687372&action=raw&ctype=text/javascript'); // [[User:Mr.Z-man/rollbackSummary.js]], [[User:Writ Keeper/rollbackSummary.js]]

	// Will run once on load, then also after each endlesscontribs load
	var possiblyContribs = function() {
		/* Hist/watch/rece/contribs */
		// Shows inline diffs everywhere (hist, watch, recent, contribs)
		window.inspectText = 'show&nbsp;diff';
		window.showText = 'show&nbsp;diff';
		window.hideText = 'hide&nbsp;diff';
		// window.inlineDiffBigUI = "true"; //Text is hardcoded, breaks above options
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Writ_Keeper/Scripts/commonHistory.js&oldid=981877063&action=raw&ctype=text/javascript'); // [[User:Writ Keeper/Scripts/commonHistory.js]]
		// This might need to be moved out? FIXME TODO
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:קיפודנחש/apiRollback.js&oldid=924056620&action=raw&ctype=text/javascript'); // [[User:קיפודנחש/apiRollback.js]]

		if (cfg.wgAction === 'history' || cfg.wgCanonicalSpecialPageName === 'Contributions') {
			/* History OR Contribs */
			// Loads in [[User:Ale_jrb/Scripts/waLib.js]]
			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Ale_jrb/Scripts/userhist.js&oldid=920398181&action=raw&ctype=text/javascript'); //[[User:Ale jrb/Scripts/userhist.js]]
			// Adjusted to work with [[User:Bradv/endlesscontribs.js]] aka [[User:Amorymeltzer/endlesscontribs.js]]
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/userhist.js&action=raw&ctype=text/javascript'); // [[User:Amorymeltzer/userhist.js]]
			// Placeholder for userhist's getScript to check for any updates to waLib, rare though they may be
			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Ale_jrb/Scripts/waLib.js&oldid=1055926602&action=raw&ctype=text/javascript');
		}
	};
	$(possiblyContribs());
	// Already established above, so add to it
	var tmpFunc = window.endlesscontribsExec;
	window.endlesscontribsExec = function() {
		tmpFunc();
		possiblyContribs();
	};
	if (cfg.wgCanonicalSpecialPageName !== 'Contributions') {
		// Add diffOnly links everywhere but diff pages
		window.DiffOnly = {
			history: true,
			recentchanges: true,
			watchlist: true,
			contributions: true,
			diff: false
		};
		// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Mr._Stradivarius/gadgets/DiffOnly.js&oldid=1056866093&action=raw&ctype=text/javascript'); // placeholder
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/DiffOnly.js&action=raw&ctype=text/javascript'); // [[User:Mr. Stradivarius/gadgets/DiffOnly.js]], [[User:Amorymeltzer/DiffOnly.js]]
	}
}

/* mw.config.exists('wgRelevantUserName') */
if (mw.config.exists('wgRelevantUserName')) {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/userinfo.js&action=raw&ctype=text/javascript'); // [[User:PleaseStand/userinfo.js]], see also [[User:Equazcion/sysopdetector.js]] Display perms, edit count, age, gender, last edited [[User:Amorymeltzer/userinfo.js]]
	// [[User:Animum/EasyBlock]], but for the modern skin [[User:Animum/easyblock.js]], [[User:Animum/easyblock.css]]
	// Also loads on all diffs; putting it here should be light than just adjusting ebPrefs.showOnPages
	// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Animum/easyblock.js&oldid=1044919537&action=raw&ctype=text/javascript'); // placeholder
	// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Animum/easyblock.css&oldid=686984610&action=raw&ctype=text/javascript'); // placeholder
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/easyblock-modern.js&action=raw&ctype=text/javascript'); // [[User:Amorymeltzer/easyblock-modern.js]], [[User:Amorymeltzer/easyblock-modern.css]]
	window.ebPrefs = {
		// returnTo:"Wikipedia:Administrator_intervention_against_vandalism&action=purge"
		loadPageOnSubmit: false
	};
}
/* cfg.wgRelevantPageIsProbablyEditable */
// Excessive perhaps, but want this after userinfo
if (cfg.wgRelevantPageIsProbablyEditable) {
	// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Writ_Keeper/Scripts/deletionFinder.js&oldid=832071460&action=raw&ctype=text/javascript'); // placeholder
	// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Writ_Keeper/Scripts/googleTitle.js&oldid=819463472&action=raw&ctype=text/javascript'); // placeholder
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/deletionFinder.js&action=raw&ctype=text/javascript'); // [[User:Writ Keeper/Scripts/deletionFinder.js]], [[User:Writ Keeper/Scripts/googleTitle.js]], [[User:Amorymeltzer/deletionFinder.js]]
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/suppressionFinder.js&action=raw&ctype=text/javascript'); // [[User:Amorymeltzer/suppressionFinder.js]] As above
}

/* js/css/json pages, likely MediaWiki or userspace */
if ((['javascript', 'css', 'json'].indexOf(cfg.wgPageContentModel) !== -1) && ($.inArray(cfg.wgAction, ['view', 'edit', 'submit']) >= 0)) {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/raw.js&action=raw&ctype=text/javascript'); // [[User:Kangaroopower/rawtab.js]], [[User:Amorymeltzer/raw.js]]

	// Show diffs in monospace.  Maybe include Scribunto?
	if (cfg.wgDiffNewId) {
		$('td.diff-addedline, td.diff-deletedline, td.diff-context').css('font-family', "Consolas, 'Courier New', monospace");
	}

	// Activate wikilinks, from [[Wikipedia:WikiProject User scripts/Scripts/Autolink]]
	// Requires commas between consecutive items
	// Awkward fix to avoid the edit box
	var targetdiv;
	if (cfg.wgAction === 'view') {
		targetdiv = document.getElementById('mw-content-text');
	} else {
		// edit or submit
		targetdiv = document.getElementById('wikiPreview');
	}
	var content = targetdiv.innerHTML;
	content = content.replace(/([^[])\[{2}([^[\]|<>\n]*)([^[\]<>\n]*?)?\]{2}([^\]])/g, '$1<a class="autolink" href="/wiki/$2">[[$2$3]]</a>$4'); // Make wikilink code into links
	targetdiv.innerHTML = content; // Write it back

	// Add personal js/css nav
	var ss = window.document.getElementsByClassName('subpages')[0];
	if (ss && cfg.wgArticleId) { // In case the page was deleted
		var modLink = ' | <a href="/wiki/User:Amorymeltzer/modern.js" title="User:Amorymeltzer/modern.js">modern.js</a> | <a href="/wiki/User:Amorymeltzer/modern.css" title=' +
			'"User:Amorymeltzer/modern.css">modern.css</a> | <a href="/wiki/Special:PrefixIndex/User:Amorymeltzer/" title="wiki/Special:PrefixIndex/User:Amorymeltzer/">subpages</a>';
		ss.innerHTML = ss.innerHTML + modLink;
	}
} else { // Not js/css/json
	if (cfg.wgAction === 'edit' || cfg.wgAction === 'submit') {
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Anomie/previewtemplatelastmod.js&oldid=683547736&action=raw&ctype=text/javascript'); // [[User:Anomie/previewtemplatelastmod]], [[User:Anomie/previewtemplatelastmod.js]] Display info about transcluded templates
		if (cfg.wgNamespaceNumber !== 0) {
			// Turn enhanced toolbar off if not in mainspace
			// Defined here to easily allow the code editor on the above pages
			mw.loader.using(['mediawiki.util'], function() {
				mw.util.addCSS('#wikiEditor-ui-toolbar {display:none;}');
			});
		}
	}
}

/* Delete, (Un)Protect, RevisionDelete, Block, or AbuseLog */
// Resurrected version of [[User:Ale jrb/Scripts/csdcheck.js]], requires some CSS (Exampless in [[User:Amorymeltzer/csdcheck.js]] or [[User:Amorymeltzer/modern.css]])
if (['delete', 'protect', 'unprotect'].indexOf(cfg.wgAction) !== -1 || ['Revisiondelete', 'Block', 'AbuseLog'].indexOf(cfg.wgCanonicalSpecialPageName) !== -1) {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/csdcheck.js&action=raw&ctype=text/javascript'); // [[User:Ale jrb/Scripts]], [[User:Amorymeltzer/csdcheck.js]]
}

// END MIXED

/*
  Some scripts need to be loaded only for certain actions
*/
/* ACTIONS */
if (cfg.wgAction === 'history') {
	/* History */
	// Make compare and revdel buttons act as links [[User:Amorymeltzer/historyButtonLinks.js]] (see [[phab:T244824]] and [[User:Mattflaschen/Compare link.js]]
	// Compare link
	$('input.historysubmit').on('click', function(e) {
		e.stopImmediatePropagation();
	});
	// Sysop links
	$('button.historysubmit').on('click', function(e) {
		e.stopImmediatePropagation();
	});

	window.histCombNoCollapse = true; // Don't collapse edits on load
	window.histCombMyBg = '#F0FFF0'; // background on your edits (light green)
	window.histCombTalk = 't'; // string to replace 'Talk'
	window.histCombContrib = 'c'; // string to replace 'contribs'
	window.histCombUndo = 'u'; // string to replace 'undo'
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Alex_Smotrov/histcomb.js&oldid=1110555621&action=raw&ctype=text/javascript'); // [[User:Alex Smotrov/histcomb.js]]

	// Shorten rollback to r; thanks to t; block to b
	// Adapted from [[User:Writ Keeper/Scripts/watchlistContribs.js]]
	// Set here rather than customize [[User:Alex Smotrov/histcomb.js]]
	$(function () {
		// $('[class^="mw-rollback-link"] a')[0].innerHTML = 'r' //By definition, there can be only one rollback on a history page
		$('[class^="mw-rollback-link"] a').each(function(index, link) {
			link.innerHTML = link.innerHTML.replace(/rollback: (\d+) edit/, 'r$1');
		});
		$('[class^="mw-thanks-thank-link"]').each(function(index, link) {
			link.innerHTML = 't';
		});
		$('[class^="mw-usertoollinks-block"]').each(function(index, link) {
			link.innerHTML = 'b';
		});
	});
} else if ((cfg.wgAction === 'edit') || (cfg.wgAction === 'submit')) {
	/* Edit and Submit */
	/* ajaxPreview stuff
	   Lives at [[User:Js/ajaxPreview.js]] ([[User:Js/ajaxPreview]]), with
	   the meat at [[User:Js/preview2.js]].  As with DisamAssist, it pulls
	   in a user script directly, so ugh.  The preference option in the
	   editing tab is nice, and saves the crap here, but I actually rather
	   like having *both* option...
	   Placehoders for any upstream updates, rare though they should be
	   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Js/ajaxPreview.js&oldid=916388391&action=raw&ctype=text/javascript');
	*/
	mw.loader.using(['mediawiki.util', 'user.options', 'jquery.textSelection'], function () {
		// window.ajaxPreviewPos = 'left'; //buttons on the left
		window.ajaxPreviewPos = 'bottom'; // buttons on the bottom, old with >
		/* Putting previews on the bottom precludes these options */
		// window.ajaxPreviewKey = ''; //"preview" button accesskey
		// window.ajaxDiffKey = ''; //"changes" button accesskey
		// window.ajaxPreviewButton = 'Ω'; //"preview" button text
		// window.ajaxDiffButton = 'Δ'; //"changes" button text
		window.ajaxPreviewMsg = {
			emptydiff: 'No changes',
			difftip: 'shift-click the button to show changes compared to this old version',
			diff2old: 'comparison to old version',
			viewtip: 'shift-click the button to update interwiki and categories as well\
 (<a href="//en.wikipedia.org/wiki/User:Js/ajaxPreview#Preview" target=_blank>more</a>)'
		};


		var ajaxPreviewPos = window.ajaxPreviewPos || 'right';
		if (!document.getElementById('wpSave')) {
			return;
		}
		// Load in the meat of the script
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Js/preview2.js&oldid=822102883&action=raw&ctype=text/javascript');

		var previewToolbar;
		if (ajaxPreviewPos !== 'bottom') {
			previewToolbar = $('<div style="float:' + ajaxPreviewPos + '" />');
			if (mw.user.options.get('usebetatoolbar')) {
				$('#wikiPreview').after('<div style="width:100%; clear:both" />', previewToolbar);
			} else {
				var el = $('#toolbar');
				if (el.length) {
					el.prepend(previewToolbar);
				} else {
					$('#editform').before(previewToolbar);
				}
			}
		}

		addBtn(window.ajaxPreviewButton, 'wpPreview', window.ajaxPreviewKey || 'p');

		if (mw.config.get('wgArticleId')) {
			addBtn(window.ajaxDiffButton, 'wpDiff', window.ajaxDiffKey || 'v');
		}

		function addBtn(name, id, akey) {
			var $btnOld = $(document.getElementById(id));
			if ($btnOld.length === 0) {
				return;
			}
			var $btn = $('<input type="button" />')
				.attr('id', id + 'Live')
				.attr('title', $btnOld.val() + ' (ajax)');
			if (ajaxPreviewPos === 'bottom') {
				$btn.val($btnOld.val()).insertBefore($btnOld.val('>'));
			} else {
				if (!name) { // extract last word from standard buttons
					name = $btnOld.val(); var i = name.lastIndexOf(' ') + 1;
					name = name.substring(i, i + 1).toUpperCase() + name.substring(i + 1);
				}
				$btn.val(name).css({height: '22px', padding: '0 1px'}).appendTo(previewToolbar);
			}
			if (akey) { // reassign acces key
				if ($btnOld.attr('accesskey') === akey) {
					$btnOld.removeAttr('accesskey').updateTooltipAccessKeys();
				}
				$btn.attr('accesskey', akey).updateTooltipAccessKeys();
			}
		}
	});
	// code to execute after each preview update
	window.ajaxPreviewExec = function(previewArea) {
		// Enable popups
		if (window.setupTooltips) {
			window.setupTooltips(previewArea);
			previewArea.ranSetupTooltipsAlready = false;
		}
		// Sortable tables/collapsible elements
		mw.loader.using([
			'jquery.tablesorter',
			'jquery.makeCollapsible'
		], function() {
			$('table.sortable').tablesorter();
			$('#wikiPreview .collapsible').makeCollapsible();
		});
	};

	mw.loader.load('//he.wikipedia.org/w/index.php?title=MediaWiki:Gadget-autocomplete.js&oldid=26575308&action=raw&ctype=text/javascript'); // [[User:ערן/autocomplete.js]], [[he:MediaWiki:Gadget-autocomplete.js]] Doesn't work with tab or beta syntax highlighter
	mw.loader.load('//tools-static.wmflabs.org/meta/scripts/pathoschild.templatescript.js'); // [[meta:TemplateScript]] Successor to [[meta:User:Pathoschild/Scripts/Regex menu framework]]

	// More succinct text when editing
	$("label[for='wpMinoredit']").html('Minor');
	$("label[for='wpWatchthis']").html('Watch');

	// Don't watch super active projectspace pages
	// AIV, RFPP (and subpages), UAA, ANI, Sandbox
	$(function () {
		if (cfg.wgNamespaceNumber === 4 && ['Administrator intervention against vandalism', 'Requests for page protection', 'Requests for page protection/Increase', 'Requests for page protection/Decrease', 'Usernames for administrator attention', 'Administrator intervention against vandalism/TB2', 'Usernames for administrator attention/Bot', "Administrators' noticeboard/Incidents", 'Sandbox'].indexOf(cfg.wgTitle) !== -1) {
			$('#wpWatchthis').prop('checked', false);
		}
	});
} else if (['purge', 'watch', 'unwatch'].indexOf(cfg.wgAction) !== -1) {
	/* Purge, (un)Watch */
	/* Automate purge/watch/unwatch confirmation dialog */
	$('form[action*="action=' + cfg.wgAction + '"]').submit();
}// END ACTIONS


// Do stuff once the page has finally loaded.  Most of these are
// shortening some personal tool names.  Twinkle requires this,
// but the built-in elements don't, I think because the TW code is
// loaded too late.  This way, they all change at the same time
// Also move a bunch of crap around and the like
// Doesn't always work
function loadFunct() {
	// Move portlets around, from [[User:MZMcBride/tabaway.js]] and Splarka
	function movePortletLi(liid, portletid, clone) {
		var li = document.getElementById(liid);
		var portlet = document.getElementById(portletid);
		if (!li || !portlet) {
			return;
		}
		var ul = portlet.getElementsByTagName('ul')[0];
		var newli = li.cloneNode(true);
		ul.appendChild(newli);
		if (!clone) {
			li.parentNode.removeChild(li);
		}
	}

	$('li#pt-userpage a').text('Amory');
	// $('li#pt-preferences a').text('prefs');
	// $('li#pt-mycontris a').text('contribs');
	$('li#t-userrights a').text('User groups');
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

	// $('#pt-logs').after($('#t-log'));

	movePortletLi('t-specialpages', 'p-navigation');
	movePortletLi('n-recentchanges', 'p-navigation');
	movePortletLi('n-randompage', 'p-navigation');
	movePortletLi('n-randomredirect', 'p-navigation');
	movePortletLi('n-randomdisam', 'p-navigation');

	movePortletLi('t-peer', 'p-edit');
	// movePortletLi('t-wdlh-check', 'p-edit');
	movePortletLi('t-findlink', 'p-edit');
	movePortletLi('ca-findduplicatelinks', 'p-edit');
	movePortletLi('pt-dabfix', 'p-edit');
	movePortletLi('pt-dabsolve', 'p-edit');
	// movePortletLi('ca-disamassist-page', 'p-edit');
	// movePortletLi('ca-disamassist-main', 'p-edit');
	// movePortletLi('ca-disamassist-same', 'p-edit');
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


// Check Check 1-2 1-2
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/test.js&action=raw&ctype=text/javascript'); // [[User:Amorymeltzer/test.js]]


/* Interesting, but not now
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/talk-tab-count.js&action=raw&ctype=text/javascript'); //[[User:Enterprisey/talk-tab-count.js]]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Equazcion/SafetyEdit.js&action=raw&ctype=text/javascript'); //[[User:Equazcion/SafetyEdit.js]]
   var sysopSafety = true;
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Bradv/splitpreview.js&action=raw&ctype=text/javascript'); //[[User:Bradv/splitpreview.js]] Preview on the side, not top
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Enterprisey/undo-last-edit.js&action=raw&ctype=text/javascript'); //[[User:Enterprisey/undo-last-edit.js]]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Writ Keeper/Scripts/watchlistContribs.js&action=raw&ctype=text/javascript'); //[[User:Writ Keeper/Scripts/watchlistContribs.js]]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Kangaroopower/MRollback.js&action=raw&ctype=text/javascript'); //[[User:Kangaroopower/MRollback.js]] Good menu though!
   mw.loader.load('//tools-static.wmflabs.org/meta/scripts/pathoschild.ajaxsysop.js'); //[[m:Ajax sysop]]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Joshua Scott/Scripts/pendingchanges.js&action=raw&ctype=text/javascript'); //[[User:Joshua Scott/Scripts/pendingchanges.js]]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Bellezzasolo/Scripts/arb.js&action=raw&ctype=text/javascript'); //[[User:Bellezzasolo/Scripts/arb.js]] Discretionary sanctions
   [[meta:User:Krinkle/Scripts/CVNSimpleOverlay]] //Too similar to mark blocked?  Maybe try on a vandal not yet blocked
   [[meta:User:Krinkle/Tools/WhatLeavesHere]]
   [[meta:User:Krinkle/Tools/Real-Time_Recent_Changes]]; also a local gadget
   [[Wikipedia:WPCleaner]]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Yair rand/HistoryView.js&action=raw&ctype=text/javascript'); //[[User:Yair rand/HistoryView.js]] Visual hist with section headers, autodiffs.  Maybe edit for toggle?
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:BethNaught/exportUserOptions.js&action=raw&ctype=text/javascript'); //[[User:BethNaught/exportUserOptions.js]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:PrimeHunter/Source links.js&action=raw&ctype=text/javascript'); //[[User:PrimeHunter/Source links.js]]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Kangaroopower/ajaxMove.js&action=raw&ctype=text/javascript'); //[[User:Kangaroopower/ajaxMove.js]]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Evad37/TextDiff.js&action=raw&ctype=text/javascript'); //[[User:Evad37/TextDiff.js]]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Pyrospirit/metadata/projectbanners.js&action=raw&ctype=text/javascript'); //Busted with [[Wikipedia:Metadata gadget]] gadget at the moment [[User:Pyrospirit/metadata/projectbanners.js]]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Nihiltres/assesslinks.js&action=raw&ctype=text/javascript'); //[[User:Nihiltres/assesslinks.js]] Color links on a page

*/

/* Not working, seem fixable
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Paranomia/simplevote.js&action=raw&ctype=text/javascript'); //[[User:Paranomia/simplevote.js]] Seems fixable for modern, maybe like XfD closer
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Dipankan001/external link.js&action=raw&ctype=text/javascript'); //[[User:Dipankan001/external link.js]]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Gary/namespace redirect.js&action=raw&ctype=text/javascript'); //[[User:Gary/namespace redirect.js]]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Dr pda/prosesize.js&action=raw&ctype=text/javascript'); //[[User:Dr pda/prosesize.js]]
   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Barticus88/WhatLinksHere.js&action=raw&ctype=text/javascript'); //[[User:Barticus88/WhatLinksHere.js]]
*/

/* Reference
   [[Wikipedia:User_scripts/List]] //See also Guide
   [[User:Facenapalm/Most_imported_scripts]]
   [[User:Haza-w/Drop-down_menus]] //[[m:MoreMenu]]
   [[User:Cyberpower678/API]]
   [[mw:Manual:Interface/JavaScript]
   [[mw:ResourceLoader/Core_modules#jquery.makeCollapsible]]
   [[mw:ResourceLoader/Migration_guide_(users)]]
   [[test:Test_suite_for_mw-collapsible]]
*/
