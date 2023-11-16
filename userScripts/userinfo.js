// Forked from https://en.wikipedia.org/w/index.php?title=User:PleaseStand/userinfo.js&oldid=803890891 to tweak some options
// See also [[User:Equazcion/sysopdetector.js]] and [[User:Anomie/useridentifier.js]]
// based on [[User:Fran Rogers/dimorphism.js]] and [[User:Splarka/sysopdectector.js]]
// See also [[User:Enterprisey/userinfo.js]]

// Display on all user (sub)pages and contribs, logs, etc.
// Edit counter link for current project
// Show a symbol if no gender pronoun selected
// Don't show the "From Wikipedia" if showing userinfo
// Add option to disable for self



// userinfoHideSelf defaults to off
if (window.userinfoHideSelf === undefined || typeof window.userinfoHideSelf !== 'boolean') {
	window.userinfoHideSelf = false;
}


function UserinfoJsFormatQty(qty, singular, plural) {
	return String(qty).replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, '$&,') + '\u00a0' + (qty === 1 ? singular : plural);
}

function UserinfoJsFormatDateRel(old) {
	// The code below requires the computer's clock to be set correctly.
	var age = new Date().getTime() - old.getTime();
	var ageNumber, ageRemainder, ageWords;
	if (age < 60000) {
		// less than one minute old
		ageNumber = Math.floor(age / 1000);
		ageWords = UserinfoJsFormatQty(ageNumber, 'second', 'seconds');
	} else if (age < 3600000) {
		// less than one hour old
		ageNumber = Math.floor(age / 60000);
		ageWords = UserinfoJsFormatQty(ageNumber, 'minute', 'minutes');
	} else if (age < 86400000) {
		// less than one day old
		ageNumber = Math.floor(age / 3600000);
		ageWords = UserinfoJsFormatQty(ageNumber, 'hour', 'hours');
		ageRemainder = Math.floor((age - (ageNumber * 3600000)) / 60000);
	} else if (age < 604800000) {
		// less than one week old
		ageNumber = Math.floor(age / 86400000);
		ageWords = UserinfoJsFormatQty(ageNumber, 'day', 'days');
	} else if (age < 2592000000) {
		// less than one month old
		ageNumber = Math.floor(age / 604800000);
		ageWords = UserinfoJsFormatQty(ageNumber, 'week', 'weeks');
	} else if (age < 31536000000) {
		// less than one year old
		ageNumber = Math.floor(age / 2592000000);
		ageWords = UserinfoJsFormatQty(ageNumber, 'month', 'months');
	} else {
		// one year or older
		ageNumber = Math.floor(age / 31536000000);
		ageWords = UserinfoJsFormatQty(ageNumber, 'year', 'years');
		ageRemainder =
			Math.floor((age - (ageNumber * 31536000000)) / 2592000000);
		if (ageRemainder) {
			ageWords += ' ' +
				UserinfoJsFormatQty(ageRemainder, 'month', 'months');
		}
	}
	return ageWords;
}

// If on a user or user talk page
if (mw.config.exists('wgRelevantUserName') && !(window.userinfoHideSelf && mw.config.get('wgRelevantUserName') === mw.config.get('wgUserName'))) {
	// add a hook to...
	$.when($.ready, mw.loader.using(['mediawiki.util'])).then(function() {
		// Request the user's information from the API.
		// Note that this is allowed to be up to 5 minutes old.
		var et = encodeURIComponent(mw.config.get('wgRelevantUserName'));

		$.getJSON(mw.config.get('wgScriptPath') + '/api.php?format=json&action=query&list=users|usercontribs&usprop=blockinfo|editcount|gender|registration|groups&uclimit=1&ucprop=timestamp&ususers=' + et + '&ucuser=' + et + '&guiuser=' + et + '&meta=allmessages|globaluserinfo&amprefix=grouppage-&amincludelocal=1')
			.done(function(query) {
				// When response arrives extract the information we need.
				if (!query.query) {
					return;
				} // Suggested by Gary King to avoid JS errors --PS 2010-08-25
				query = query.query;
				var user, invalid, missing, groups, groupPages = {}, editcount, registration, blocked, locked, partial, gender, lastEdited;
				try {
					user = query.users[0];
					invalid = typeof user.invalid !== 'undefined';
					missing = typeof user.missing !== 'undefined';
					groups = typeof user.groups === 'object' ? user.groups : [];
					editcount = typeof user.editcount === 'number' ? user.editcount : null;
					registration = typeof user.registration === 'string' ?
						new Date(user.registration) : null;
					blocked = typeof user.blockedby !== 'undefined';
					locked = typeof query.globaluserinfo.locked !== 'undefined';
					partial = typeof user.blockpartial !== 'undefined';
					gender = typeof user.gender === 'string' ? user.gender : null;
					lastEdited = (typeof query.usercontribs[0] === 'object') &&
						(typeof query.usercontribs[0].timestamp === 'string') ?
						new Date(query.usercontribs[0].timestamp) : null;
					for (var am = 0; am < query.allmessages.length; am++) {
						groupPages[query.allmessages[am].name.replace('grouppage-', '')] = query.allmessages[am]['*'].replace('{{ns:project}}:', 'Project:');
					}
				} catch (e) {
					return; // Not much to do if the server is returning an error (e.g. if the username is malformed).
				}

				// Format the information for on-screen display

				var statusText = '';
				var ipUser = false;
				var ipv4User = false;
				var ipv6User = false;

				// User status
				if (locked) {
					statusText += '<a href="//meta.wikimedia.org/wiki/Special:CentralAuth/' + user.name +
						'">locked</a> ';
					if (blocked) {
						statusText += 'and ';
					}
				}
				if (blocked) {
					statusText += '<a href="' + mw.config.get('wgScript') +
						'?title=Special:Log&amp;page=' +
						encodeURIComponent(mw.config.get('wgFormattedNamespaces')[2] + ':' + user.name) +
						'&amp;type=block">' + (partial ? 'partially ' : '') + 'blocked</a> ';
				}
				if (missing) {
					statusText += 'username not registered';
				} else if (invalid) {
					ipv4User = mw.util.isIPv4Address(user.name);
					ipv6User = mw.util.isIPv6Address(user.name);
					ipUser = ipv4User || ipv6User;
					if (ipv4User) {
						statusText += 'anonymous IPv4 user';
					} else if (ipv6User) {
						statusText += 'anonymous IPv6 user';
					} else {
						statusText += 'invalid username';
					}
				} else {
					// User is registered and may be in a privileged group. Below we have a list of user groups.
					// Only need the ones different from the software's name (or ones to exclude), though.
					var friendlyGroupNames = {
						// Exclude implicit user group information provided by MW 1.17 --PS 2010-02-17
						'*': false,
						'user': false,
						'autoconfirmed': false,
						'named': false,
						'abusefilter': 'edit filter manager',
						'abusefilter-helper': 'edit filter helper',
						'accountcreator': 'account creator',
						'autoreviewer': 'autopatrolled user',
						'confirmed': 'confirmed user',
						'eventcoordinator': 'event coordinator',
						'extendedconfirmed': 'extended confirmed user',
						'extendedmover': 'page mover',
						'filemover': 'file mover',
						'flow-bot': 'Flow bot',
						'import': 'importer',
						'ipblock-exempt': 'IP block exemption',
						'massmessage-sender': 'mass message sender',
						'oversight': 'oversighter',
						'patroller': 'new page reviewer',
						'reviewer': 'pending changes reviewer',
						'suppress': 'oversighter',
						'sysop': 'administrator',
						'templateeditor': 'template editor',
						'transwiki': 'transwiki importer'
					};

					var friendlyGroups = [];
					for (var i = 0; i < groups.length; ++i) {
						var s = groups[i];
						var t = Object.prototype.hasOwnProperty.call(friendlyGroupNames, s) ? friendlyGroupNames[s] : s;
						if (t) {
							if (Object.prototype.hasOwnProperty.call(groupPages, s)) {
								friendlyGroups.push('<a href="' + mw.config.get('wgArticlePath').replace('$1', encodeURIComponent(groupPages[s])) + '">' + t + '</a>');
							} else {
								friendlyGroups.push(t);
							}
						}
					}
					switch (friendlyGroups.length) {
						case 0:
							// User not in a privileged group
							// Changed to "registered user" by request of [[User:Svanslyck]]
							// --PS 2010-05-16

							// statusText += "user";
							if (blocked || locked) {
								statusText += 'user';
							} else {
								statusText += 'registered user';
							}
							break;
						case 1:
							statusText += friendlyGroups[0];
							break;
						case 2:
							statusText += friendlyGroups[0] + ' and ' + friendlyGroups[1];
							break;
						default:
							statusText += friendlyGroups.slice(0, -1).join(', ') +
								', and ' + friendlyGroups[friendlyGroups.length - 1];
							break;
					}
				}

				// Registration date
				if (registration) {
					var firstLoggedUser = new Date('09 07, 2005 22:16Z'); // When the [[Special:Log/newusers]] was first activated
					if (registration >= firstLoggedUser) {
						statusText += ", <a href='" + mw.config.get('wgScript') +
							'?title=Special:Log&amp;type=newusers&amp;dir=prev&amp;limit=1&amp;user=' +
							et + "'>" + UserinfoJsFormatDateRel(registration) + '</a> old';
					} else {
						statusText += ", <a href='" + mw.config.get('wgScript') +
							'?title=Special:ListUsers&amp;limit=1&amp;username=' +
							et + "'>" + UserinfoJsFormatDateRel(registration) + '</a> old';
					}
				}

				// Edit count
				if (editcount !== null) {
					statusText += ', with ' +
						'<a href="//xtools.wmflabs.org/ec/' +
						mw.config.get('wgDBname') +
						'/' + encodeURIComponent(user.name) + '">' +
						UserinfoJsFormatQty(editcount, 'edit', 'edits') + '</a>';
				}

				// Prefix status text with correct article
				if ('AEIOaeio'.indexOf(statusText.charAt(statusText.indexOf('>') + 1)) >= 0) {
					statusText = 'An ' + statusText;
				} else {
					statusText = 'A ' + statusText;
				}

				// Add full stop to status text
				statusText += '.';

				// Last edited --PS 2010-06-27
				// Added link to contributions page --PS 2010-07-03
				if (lastEdited) {
					statusText += '  Last edited <a href="' + mw.config.get('wgArticlePath').replace('$1', 'Special:Contributions/' + encodeURIComponent(user.name)) + '">' + UserinfoJsFormatDateRel(lastEdited) + ' ago</a>.';
				}

				// Show the correct gender symbol
				var fh = document.getElementById('firstHeading') || document.getElementById('section-0');
				if (!fh) {
					return; // e.g. Minerva user talk pages
				}
				// Add classes for blocked, registered, and anonymous users
				var newClasses = [];
				if (blocked) {
					newClasses.push('ps-blocked');
				}
				if (ipUser) {
					newClasses.push('ps-anonymous');
				} else if (invalid) {
					newClasses.push('ps-invalid');
				} else {
					newClasses.push('ps-registered');
				}
				fh.className += (fh.className.length ? ' ' : '') + groups.map(function(s) {
					return 'ps-group-' + s;
				}).concat(newClasses).join(' ');
				var genderSpan = document.createElement('span');
				genderSpan.id = 'ps-gender-' + (gender || 'unknown');
				genderSpan.style.paddingLeft = '0.25em';
				genderSpan.style.fontFamily = '"Lucida Grande", "Lucida Sans Unicode", "sans-serif"';
				genderSpan.style.fontSize = '75%';
				var genderSymbol;
				switch (gender) {
					case 'male': genderSymbol = '\u2642'; break;
					case 'female': genderSymbol = '\u2640'; break;
					default: genderSymbol = '\u2609'; break;
						// See https://en.wikipedia.org/wiki/Miscellaneous_Symbols
				}
				genderSpan.appendChild(document.createTextNode(genderSymbol));
				fh.appendChild(genderSpan);

				// Now show the other information. Non-standard? Yes, but it gets the job done.
				// Add a period after the tagline when doing so. --PS 2010-07-03

				var ss = document.getElementsByClassName('mw-contributions-editor-info')[0];
				if (!ss) {
					ss = document.getElementById('siteSub');
					if (!ss) {
						ss = document.createElement('div');
						ss.id = 'siteSub';
						ss.innerHTML = '';
						var bc = document.getElementById('bodyContent');
						bc.insertBefore(ss, bc.firstChild);
					}
				}
				//            ss.innerHTML = '<span id="ps-userinfo">' + statusText + '</span> ' + ss.innerHTML + '.';
				ss.innerHTML = '<span id="ps-userinfo">' + statusText + '</span>';
				ss.style.display = 'block';
			});
	});
}
