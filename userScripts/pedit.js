// Inspired by [[User:Smith609/toolbox.js]]
// Taken from https://en.wikipedia.org/w/index.php?title=User:Smith609/toolbox.js&oldid=281341033
// Editing tools restricted to mainspace
// See also [[User:Amorymeltzer/pinfo.js]]
// <nowiki>

if (mw.config.get('wgNamespaceNumber') === '0') {
	$(function () {
		var pTb = document.getElementById('p-tb');
		var pEdit = pTb.cloneNode(true);

		pEdit.id = 'p-edit';
		pEdit.innerHTML = '<h3>Edit</h3><div class=pBody><ul></ul></div>';
		pTb.parentNode.insertBefore(pEdit, pTb.nextSibling);


		mw.loader.load('ext.gadget.Prosesize'); // [[Wikipedia:Prosesize]] at [[MediaWiki:Gadget-Prosesize.js]], rewritten from  [[User:Dr_pda/prosesize.js]]
		mw.util.addPortletLink('p-edit', '//toolserver.org/~dispenser/view/Peer_reviewer#page:' + mw.config.get('wgPageName'), 'Peer review', 't-peer', 'Peer review');
		mw.util.addPortletLink('p-edit', 'https://tools.wmflabs.org/refill/ng/result.php?page=' + encodeURIComponent(mw.config.get('wgPageName')) + '&defaults=y&wiki=en', 'reFill 2', 't-reflinks'); // [[User:Zhaofeng Li/reFill]], [[m:User:Zhaofeng_Li/Reflinks.js]], [[toollabs:refill]]
		mw.loader.load('https://meta.wikimedia.org/w/index.php?title=User:Zhaofeng_Li/Reflinks.js&oldid=18773634&action=raw&ctype=text/javascript');
		//    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Lourdes/Backlinks.js&action=raw&ctype=text/javascript'); //[[User:Lourdes/Backlinks.js]]
		mw.util.addPortletLink('p-edit', '//edwardbetts.com/find_link/' + mw.config.get('wgPageName'), 'Find backlinks', 't-findlink', 'Find potential backlinks for this page'); // [[User:Edward/Find link]]
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Evad37/duplinks-alt.js&oldid=975407468&action=raw&ctype=text/javascript'); // [[User:Evad37/duplinks-alt]], [[User:Evad37/duplinks-alt.js]] replaced [[User:Ucucha/duplinks.js]]

		if ($.inArray('All article disambiguation pages', mw.config.get('wgCategories')) >= 0) {
			mw.util.addPortletLink('p-edit', '//dispenser.info.tm/~dispenser/cgi-bin/dabfix.py?page=' + mw.config.get('wgPageName'), 'DabFix', 'pt-dabfix', 'DabFix');
		} else {
			mw.util.addPortletLink('p-edit', '//dispenser.info.tm/~dispenser/cgi-bin/dab_solver.py?page=' + mw.config.get('wgPageName'), 'DabSolve', 'pt-dabsolve', 'DabSolve');
		}

		mw.util.addPortletLink('p-edit', 'https://dispenser.info.tm/~dispenser/cgi-bin/webchecklinks.py?page=' + mw.config.get('wgPageName'), 'Checklinks', 't-checklinks', 'Checklinks');
		mw.loader.load('ext.gadget.citations'); // [[MediaWiki:Gadget-citations.js]]
		mw.util.addPortletLink('p-edit', '//tools.wmflabs.org/iabot/index.php?page=runbotsingle&pagesearch=' + mw.config.get('wgPageName'), 'IABot', 't-iabot', 'Load the IA bot interface');


		/* DisamAsist stuff
		   Lives at [[User:Qwertyytrewqqwerty/DisamAssist.js]], [[User:Qwertyytrewqqwerty/DisamAssist]]
		   but that's directly pulling in an es user page ([[Usuario:Qwertyytrewqqwerty/DisamAssist-core.js]]), which, ugh.
		   So, instead, I copy that page's config, then directly import the
		   stuff I want.  I'm keeping the commented-out local load, though, so
		   if the local config changes, I'll at least know, right?
		   mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Qwertyytrewqqwerty/DisamAssist.js&oldid=829726913&action=raw&ctype=text/javascript');
		*/
		window.DisamAssist = jQuery.extend(true, {
			cfg: {
				/* Categories where disambiguation pages are added (usually by a template like {{Disambiguation}} */
				disamCategories: ['All disambiguation pages'],
				/* "Canonical names" of the templates that may appear after ambiguous links
				 * and which should be removed when fixing those links */
				disamLinkTemplates: [
					'Disambiguation needed',
					'Ambiguous link',
					'Amblink',
					'Dab needed',
					'Disamb-link',
					'Disambig needed',
					'Disambiguate',
					'Dn',
					'Needdab'
				],

				/* "Canonical names" of the templates that designate intentional links to
				 * disambiguation pages */
				disamLinkIgnoreTemplates: [
					'R from ambiguous page',
					'R to disambiguation page',
					'R from incomplete disambiguation'
				],
				/* Format string for "Foo (disambiguation)"-style pages */
				disamFormat: '$1 (disambiguation)',
				/* Regular expression matching the titles of disambiguation pages (when they are different from
				 * the titles of the primary topics) */
				disamRegExp: '^(.*) \\(disambiguation\\)$',
				/* Text that will be inserted after the link if the user requests help. If the value is null,
				 * the option to request help won't be offered */
				disamNeededText: '{{dn|date={{subst:CURRENTMONTHNAME}} {{subst:CURRENTYEAR}}}}',
				/* Content of the "Foo (disambiguation)" pages that will be created automatically when using
				 * DisamAssist from a "Foo" page */
				redirectToDisam: '#REDIRECT [[$1]] {{R to disambiguation page}}',
				/* Whether intentional links to disambiguation pages can be explicitly marked by adding " (disambiguation)" */
				intentionalLinkOption: true,
				/* Namespaces that will be searched for incoming links to the disambiguation page (pages in other
				 * namespaces will be ignored) */
				targetNamespaces: [0, 6, 10, 14, 100, 108],
				/* Number of backlinks that will be downloaded at once
				 * When using blredirect, the maximum limit is supposedly halved
				 * (see http://www.mediawiki.org/wiki/API:Backlinks) */
				backlinkLimit: 250,
				/* Number of titles we can query for at once */
				queryTitleLimit: 50,
				/* Number of characters before and after the incoming link that will be displayed */
				radius: 300,
				/* Height of the context box, in lines */
				numContextLines: 4,
				/* Number of pages that will be stored before saving, so that changes to them can be
				 * undone if need be */
				historySize: 2,
				/* Minimum time in seconds since the last change was saved before a new edit can be made. A
				 * negative value or 0 disables the cooldown. Users with the "bot" right won't be affected by
				 * the cooldown */
				editCooldown: 5,
				/* Specify how the watchlist is affected by DisamAssist edits. Possible values: "watch", "unwatch",
				 * "preferences", "nochange" */
				watch: 'nochange'
			},

			txt: {
				start: 'Disambiguate links',
				startMain: 'Disambiguate links to primary topic',
				startSame: 'Disambiguate links to DAB',
				close: 'Close',
				undo: 'Undo',
				omit: 'Skip',
				refresh: 'Refresh',
				titleAsText: 'Different target',
				disamNeeded: 'Tag {{dn}}',
				intentionalLink: 'Intentional link to DAB',
				titleAsTextPrompt: 'Specify the new target:',
				removeLink: 'Unlink',
				optionMarker: ' [Link here]',
				targetOptionMarker: ' [Current target]',
				redirectOptionMarker: ' [Current target (redirected)]',
				pageTitleLine: 'In <a href="$1">$2</a>:',
				noMoreLinks: 'No more links to disambiguate.',
				pendingEditCounter: 'Saving: $1; in history: $2',
				pendingEditBox: 'DisamAssist is currently saving changes ($1).',
				pendingEditBoxTimeEstimation: '$1; approximate time remaining: $2',
				pendingEditBoxLimited: 'Please don\'t close this tab until all pending changes have been saved. You may keep '
					+ 'editing Wikipedia in a different tab, but be advised that using multiple instances of DisamAssist at '
					+ 'the same time is discouraged, as a high number of edits over a short time period may be disruptive.',
				error: 'Error: $1',
				fetchRedirectsError: 'Unable to fetch redirects: "$1".',
				getBacklinksError: 'Unable to download backlinks: "$1".',
				fetchRightsError: 'Unable to fetch user rights: "$1",',
				loadPageError: 'Unable to load $1: "$2".',
				savePageError: 'Unable to save changes to $1: "$2".',
				dismissError: 'Dismiss',
				pending: 'There are unsaved changes in DisamAssist. To save them, please press Close',
				editInProgress: 'DisamAssist is currently performing changes. If you close the tab now, they may be lost.',
				ellipsis: '...',
				notifyCharacter: '✔',
				summary: 'Disambiguating links to [[$1]] ($2) using [[User:Qwertyytrewqqwerty/DisamAssist|DisamAssist]].',
				summaryChanged: 'link changed to [[$1]]',
				summaryOmitted: 'link skipped',
				summaryRemoved: 'link removed',
				summaryIntentional: 'intentional link to DAB',
				summaryHelpNeeded: 'help needed',
				summarySeparator: '; ',
				redirectSummary: 'Creating redirect to [[$1]] using [[User:Qwertyytrewqqwerty/DisamAssist|DisamAssist]].'
			}
		}, window.DisamAssist || {});
		mw.loader.load('//es.wikipedia.org/w/index.php?title=Usuario:Qwertyytrewqqwerty/DisamAssist-core.js&oldid=137440589&action=raw&ctype=text/javascript');
		mw.loader.load('//es.wikipedia.org/w/index.php?title=Usuario:Qwertyytrewqqwerty/DisamAssist.css&oldid=71656505&action=raw&ctype=text/css', 'text/css');


		if (mw.config.get('wgAction') === 'edit' || mw.config.get('wgAction') === 'submit') {
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Salix_alba/Citoid.js&oldid=1033781796&action=raw&ctype=text/javascript'); // [[User:Salix_alba/Citoid.js]]
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Ohconfucius/script/formatgeneral.js&oldid=1026083586&action=raw&ctype=text/javascript'); // [[User:Ohconfucius/script/formatgeneral.js]]
			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Ohconfucius/script/Common Terms.js&action=raw&ctype=text/javascript'); //[[User:Ohconfucius/script/Common Terms.js]] Hide countries, etc. Loads outdated regex menu framework, annoying
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Dr_pda/editrefs.js&oldid=847786367&action=raw&ctype=text/javascript'); // [[User:Dr_pda/editrefs.js]] Show on mainpage as well, like autoed?
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Meteor_sandwich_yum/Tidy_citations.js&oldid=600543255&action=raw&ctype=text/javascript'); // [[User:Meteor sandwich yum/Tidy citations.js]]

			// These aren't in the sidebar, but are relevant to mainspace editing, so loaded here rather than in modern.js for convenience
			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:TheJJJunk/ARA.js&oldid=1018152254&action=raw&ctype=text/javascript'); // placeholder
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/ARAspaceless.js&action=raw&ctype=text/javascript'); // [[User:TheJJJunk/ARA.js]]
			// mw.loader.load('//en.wikipedia.org/w/index.php?title=User:PC-XT/Advisor.js&oldid=1012510957&action=raw&ctype=text/javascript'); // placeholder
			mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/AdvisorDashless.js&action=raw&ctype=text/javascript'); // [[User:Cameltrader/Advisor.js]] and [[User:PC-XT/Advisor.js]] Doesn't work with beta syntax highlighters
			mw.loader.load('ext.gadget.ProveIt'); // [[MediaWiki:Gadget-ProveIt.js]] [[WP:ProveIt]] [[commons:MediaWiki:Gadget-ProveIt.js]]
			mw.loader.load('//de.wikipedia.org/w/index.php?title=Benutzer:TMg/autoFormatter.js&oldid=216055159&action=raw&ctype=text/javascript'); // [[m:User:TMg/autoFormatter]]
		}
	});
}
// </nowiki>
