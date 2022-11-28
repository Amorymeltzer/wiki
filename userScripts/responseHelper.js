// Originally from https://en.wikipedia.org/w/index.php?title=User:MusikAnimal/responseHelper.js&oldid=778175826
// Tweaked for my own purposes
// <pre><nowiki>
(function() {
	var responses = {}, inline = false, indentation = ":", templateName = "", defaultPrompt = "", anew = false, spi = false, unresolved;

	$(document).ready(function() {
		mw.loader.using( ['mediawiki.util'], function() {
			setResponses();

			for (var response in responses) {
				var id = responses[response].id || responses[response].code.replace(/\W/g, '');
				mw.util.addPortletLink('p-tb', 'javascript:', "(" + response + ")", "rh-" + id, responses[response].summary);
				$("#rh-"+id).click({
					response : responses[response]
				}, respondFn);
			}
		});
	});

	function setResponses() {
		if (mw.config.get('wgEditMessage') === 'editingsection') {
			if (/Wikipedia:Administrator_intervention_against_vandalism/.test(mw.config.get('wgPageName'))) {
				indentation = "*:";
				templateName = "AIV";
				inline = true;
				responses = {
					"Insufficient activity" : {
						code : "i",
						summary : "Insufficient recent activity to warrant a block"
					},
					"No vand since final" : {
						code : "f",
						summary : "No vandalism since final warning"
					},
					"No edits since warn" : {
						code : "nesw",
						summary : "No edits since being warned"
					},
					"Stale report" : {
						code : "e|$1",
						summary : "Stale report. ",
						prompt : "How long since the user last edited?"
					},
					"Stale (was good)" : {
						code : "sn|$1",
						summary : "Report was good but is now stale. ",
						prompt : "How long since the user last edited?"
					},
					"Stale warning" : {
						code : "ow|$1",
						summary : "Stale warning. ",
						prompt : "The last warning issued how long ago?"
					},
					"Insufficient warnings" : {
						code : "ns",
						summary : "User insufficiently warned"
					},
					"4im inappropriate" : {
						code : "4im",
						summary : "User inappropriately warned with 4im"
					},
					"Not vandalism" : {
						code : "nv",
						summary : "Edits are not vandalism"
					},
					"Declined" : {
						code : "dc",
						summary : "Declined. ",
						prompt : "Reason?"
					},
					"Not punitive" : {
						code : "np",
						summary : "Blocks are preventive, not punitive"
					},
					"Warned user" : {
						code : "w",
						summary : "Warned user"
					},
					"Checking" : {
						code : "chk",
						summary : "Checking"
					},
					"Monitoring" : {
						code : "m",
						summary : "Actively monitoring user"
					},
					"Question" : {
						code : "q",
						summary : "Question. ",
						prompt : "Question:"
					},
					"Note" : {
						code : "n",
						summary : "Note. ",
						prompt : "Note:"
					},
					"IP not indef'd" : {
						code : "in",
						summary : "IPs are generally not blocked indefinitely"
					},
					"Shared IP" : {
						code : "s",
						summary : "Appears to be a shared IP"
					},
					"Content dispute" : {
						code : "c",
						summary : "Content dispute"
					},
					"WP:ANEW" : {
						code : "3rr",
						summary : "Consider reporting to [[WP:ANEW]]"
					},
					"WP:AN/I" : {
						code : "a",
						summary : "Consider reporting to [[WP:AN/I]]"
					},
					"WP:UAA" : {
						code : "u",
						summary : "Consider reporting to [[WP:UAA]]"
					},
					"WP:RFPP" : {
						code : "r",
						summary : "Consider reporting to [[WP:RFPP]]"
					},
					"WP:SPI" : {
						code : "sp",
						summary : "Consider reporting to [[WP:SPI]]"
					},
					"Page protected" : {
						code : "p",
						summary : "Page protected"
					},
					"Page deleted" : {
						code : "d",
						summary : "Page deleted"
					},
					"False positive—bot only" : {
						code : "fp",
						summary : "False positive"
					}
				};
			} else if (/Wikipedia:Usernames_for_administrator_attention/.test(mw.config.get('wgPageName'))) {
				indentation = "*:";
				templateName = "UAA";
				defaultPrompt = "Reason?";
				inline = true;
				responses = {
					"Checking" : {
						code : "chk",
						summary : "Checking"
					},
					"Note" : {
						code : "n",
						summary : "Note. ",
						prompt : "Note:"
					},
					"Question" : {
						code : "q",
						summary : "Question. ",
						prompt : "Question: "
					},
					"Comment" : {
						code : "c",
						summary : "Comment. ",
						prompt : "Comment:"
					},
					"Wait" : {
						code : "w",
						summary : "Wait until the user edits"
					},
					"Monitor" : {
						code : "m",
						summary : "Keep monitoring the user, until their username is more clear"
					},
					"Being discussed" : {
						code : "d",
						summary : "Being discussed with the user"
					},
					"Discussed, const. edits" : {
						code : "dc",
						summary : "Being discussed with the user, since they have edited constructively"
					},
					"Requested change" : {
						code : "rc",
						summary : "User has requested a username change"
					},
					"Changed username" : {
						code : "ch",
						summary : "User has changed their username"
					},
					"Problem" : {
						code : "p",
						summary : "Problem: This account does not exist or may be hidden"
					},
					"Stale" : {
						code : "s",
						summary : "Stale: Account has not been used in the last 2-3 weeks"
					},
					"Not violation" : {
						code : "not",
						summary : "Not a blatant violation of the username policy"
					},
					"Not vio, real name" : {
						code : "real",
						summary : "Not a violation of the username policy as real name, consider [[WP:COI/N]]"
					},
					"Not vio, watch edits" : {
						code : "e",
						summary : "Not a blatant violation of the username policy, but worth keeping an eye on their edits"
					},
					"Not vio, COI" : {
						code : "coi",
						summary : "Not a blatant violation of the username policy. Consider filing a report at the [[WP:COI/N]]"
					},
					"Not vio, RFCN" : {
						code : "r",
						summary : "Not a blatant violation of the username policy. Please discuss this with the user or at [[WP:RFCN]] if necessary"
					},
					"False positive—bot only" : {
						code: "fp",
						summary: "False positive by bot. Username is not a blatant violation of the username policy"
					}
				};
			} else if (/Wikipedia:Requests_for_undeletion/.test(mw.config.get('wgPageName'))) {
				indentation = "*";
				templateName = "subst:UND";
				responses = {
					"Done" : {
						code : "d",
						summary : "Done. ",
						prompt : "Additional comment?"
					},
					"Done (PROD)" : {
						code : "prod",
						summary : "Done: Contested [[WP:PROD|proposed deletion]], the article has been restored upon request."
					},
					"Done (G13)" : {
						code : "g13",
						summary : "Done: [[WP:DRAFTS|Draft]] or [[WP:AfC|AfC]] submission deleted under [[WP:G13|CSD G13]]."
					},
					"Done (G13 draft)" : {
						code : "g13-draft",
						summary : "Done: [[WP:DRAFTS|Draft]] deleted under [[WP:G13|CSD G13]]. Please continue to improve and submit for review."
					},
					"Done (AfC)" : {
						code : "afc",
						summary : "Done: [[WP:AfC|AfC]] submission deleted under [[WP:G13|CSD G13]]. Please edit to address any issues and re-submit."
					},
					"Done (AfC no review)" : {
						code : "afc-ns",
						summary : "Done: [[WP:AfC|AfC]] submission deleted under [[WP:G13|CSD G13]]. Please remember to submit the draft for review."
					},
					"Userfied" : {
						code : "u|$1",
						summary : "Userfied at [[$1]]",
						prompt : "Full title of userspace page?",
						valueRequired : true
					},
					"Userfied (notability)" : {
						code : "userA7|$1|$2",
						summary : "Userfied at [[$1]]",
						prompt : "Full title of userspace page?",
						prompt2 : "Username of admin who deleted the original page?",
						valueRequired : true
					},
					"Not done" : {
						code : "nd",
						summary : "Not Done. ",
						prompt : "Reason?"
					},
					"Not done (permanent)" : {
						code : "nd2",
						summary : "Not done and will not be done.",
						prompt : "Additional comment?"
					},
					"Not done (company)" : {
						code : "ndc",
						summary : "Not done: does not meet [[WP:CORP|notability guideline on companies]]"
					},
					"Not done (person)" : {
						code : "ndp",
						summary : "Not done: does not meet [[WP:BIO|notability guideline on people]]"
					},
					"Not done (music)" : {
						code : "ndb",
						summary : "Not done: does not meet [[WP:NMUSIC|notability guideline on music]]"
					},
					"Not done (G11)" : {
						code : "g11",
						summary : "Not done: [[WP:G11|blatant advertising]]"
					},
					"Not done (A7)" : {
						code : "c|a7",
						summary : "Not done: page was deleted as giving [[WP:A7|no indication of importance]]"
					},
					"Not done (copyvio)" : {
						code : "copy|$1",
						summary : "Not done: page is a [[WP:COPYVIO|copyright violation]] ",
						prompt : "Source URL?"
					},
					"Not done (unsuitable)" : {
						code : "in",
						summary : "Not done: inappropriate topic for Wikipedia"
					},
					"Not done (live)" : {
						code : "nyd",
						summary : "Not done: page has not yet been deleted"
					},
					"Not done (live, PROD)" : {
						code : "nydp",
						summary : "Not done: page has not yet been deleted; See [[WP:PROD]] for responding to proposed deletion."
					},
					"Not done (live, BLP)" : {
						code : "nydb",
						summary : "Not done: page has not yet been deleted; See [[WP:BLPPROD]] for responding to proposed deletion."
					},
					"Not done (nonexistent)" : {
						code : "dne",
						summary : "Not done: a deleted page with this title does not appear to exist"
					},
					"Not done (AfD)" : {
						code : "afd|$1|$2",
						summary : "Not done: page was deleted following a [[$1|deletion discussion]]",
						prompt : "Full title of deletion discussion page?",
						prompt2 : "Username of admin who closed the discussion?",
						valueRequired : true,
						value2Required : true
					},
					"Blocked" : {
						code : "blocked",
						summary : "Not done: user blocked ",
						prompt : "Additional comment?"
					},
					"Malformed report" : {
						code : "malformed",
						summary : "Not done: Please repair your request"
					},
					"Declined (need info)" : {
						code : "2nd",
						summary : "Declined pending further information"
					}
				};
			} else if (/Wikipedia:Sockpuppet_investigations/.test(mw.config.get('wgPageName'))) {
				spi = true;
				indentation = "*";
				templateName = "";
				responses = {
					"Admin note" : {
						code : "administrator note",
						summary : "Admin note. ",
						prompt : "Administrator note:"
					},
					"Clerk needed" : {
						code : "Clerk Request",
						summary : "Clerk assistance requested. ",
						prompt : "Additional comment?"
					},
					"Blocked and tagged" : {
						code : "bnt",
						summary : "Blocked and tagged. ",
						prompt : "Additional comment?"
					},
					"Blocked, need tags" : {
						code : "Sblock",
						summary : "Blocked but awaiting tags. ",
						prompt : "Additional comment?"
					},
					"IP blocked" : {
						code : "IPblock",
						summary : "IP blocked. ",
						prompt : "Additional comment?"
					},
					"Looks like duck" : {
						code : "Duck",
						summary : "It looks like a duck to me. ",
						prompt : "Additional comment?"
					},
					"Sounds like duck" : {
						code : "Megaphoneduck",
						summary : "It sounds like a duck quacking into a megaphone to me",
						prompt : "Additional comment?"
					},
					"Need more info" : {
						code : "MoreInfo",
						summary : "Additional information needed. ",
						prompt : "Additional comment?"
					},
					"Relisted" : {
						code: "Relisted",
						summary : "Relisted. ",
						prompt : "Additional comment?"
					},
					"Clerk note" : {
						code : "Clerknote",
						summary : "Clerk note. ",
						prompt : "Additional comment?"
					},
					"Clerk declined" : {
						code : "Decline",
						summary : "Clerk declined",
						prompt : "Additional comment?"
					},
					"Clerk endorsed" : {
						code : "Clerk endorsed",
						summary : "Clerk endorsed. ",
						prompt : "Additional comment?"
					},
					"Clerk self-endorsed" : {
						code : "selfendorse",
						summary : "Self-endorsed by clerk for [[Wikipedia:CheckUser|Checkuser]] attention. ",
						prompt : "Additional comment?"
					},
					"Completed" : {
						code : "Completed",
						summary : "Completed. ",
						prompt : "Additional comment?"
					},
					"Not possible" : {
						code : "Impossible",
						summary : "Not possible. ",
						prompt : "Additional comment?"
					},
					"CU in progress" : {
						code : "Inprogress",
						summary : "In progress. ",
						prompt : "Additional comment?"
					},
					"CU confirmed" : {
						code : "Confirmed",
						summary : "Confirmed. ",
						prompt : "Additional comment?"
					},
					"CU confirmed-nc" : {
						code : "Confirmed-nc",
						summary : "Confirmed with respect to the named user(s), No comment with respect to IP address(es). ",
						prompt : "Additional comment?"
					},
					"CU likely" : {
						code : "Likely",
						summary : "Likely. ",
						prompt : "Additional comment?"
					},
					"CU unlikely" : {
						code : "Unlikely",
						summary : "Unlikely. ",
						prompt : "Additional comment?"
					},
					"CU possible" : {
						code : "Possible",
						summary : "Possible. ",
						prompt : "Additional comment?"
					},
					"CU indistingish" : {
						code : "Tallyho",
						summary : "Technically indistinguishable. ",
						prompt : "Additional comment?"
					},
					"CU inconclusive" : {
						code : "Inconclusive",
						summary : "Inconclusive. ",
						prompt : "Additional comment?"
					},
					"CU no sleepers" : {
						code : "Nosleepers",
						summary : "No sleepers [[WP:PIXIEDUST|immediately visible]]. ",
						prompt : "Additional comment?"
					},
					"CU declined" : {
						code : "Declined",
						summary : "Declined. ",
						prompt : "Additional comment?"
					},
					"CU unnecessary" : {
						code : "Unnecessary",
						summary : "Unnecessary. ",
						prompt : "Additional comment?"
					},
					"CU behave" : {
						code : "behav",
						summary : "Behavioural evidence needs evaluation. ",
						prompt : "Additional comment?"
					},
					"CU no comment" : {
						code : "nc",
						summary : "No comment with respect to IP address(es). ",
						prompt : "Additional comment?"
					},
					"CU no comment X" : {
						code : "nc|$1",
						summary : "No comment regarding ",
						prompt: "No comment regarding...?"
					},
					"CU stale" : {
						code : "StaleIP",
						summary : "Stale (too old). ",
						prompt : "Additional comment?"
					},
					"CU crystal ball" : {
						code : "Crystalball",
						summary : "[[Wikipedia:CheckUser|CheckUser]] is not a crystal ball. ",
						prompt : "Additional comment?"
					},
					"CU pixie dust" : {
						code : "Pixiedust",
						summary : "[[Wikipedia:CheckUser|CheckUser]] is not magic [[pixie dust]]. ",
						prompt : "Additional comment?"
					},
					"CU fishing" : {
						code : "Fishing",
						summary : "[[Wikipedia:CheckUser|CheckUser]] is not for [[WP:FISHING|fishing]]. ",
						prompt : "Additional comment?"
					},
					"CU 8-ball" : {
						code : "8ball",
						summary : "The CheckUser Magic 8-Ball says: ",
						prompt : "The CheckUser Magic 8-Ball says...?"
					}
				};
			} else if (/Wikipedia:Requests_for_permissions\/(?!Rollback|Confirmed|Page_mover)/.test(mw.config.get('wgPageName'))) {
				// base responses for permission pages
				indentation = ":";
				templateName = "";
				defaultPrompt = "Reason?";
				responses = {
					"Done" : {
						code : "done",
						summary : "Done"
					},
					"Not done" : {
						code : "not done",
						summary : "Not done. ",
						prompt : "Reason?"
					},
					"Revoked" : {
						code : "revoked",
						summary : "Revoked. "
					},
					"Comment" : {
						code : "comment",
						summary : "Comment. ",
						prompt : "Comment:"
					},
					"Admin note" : {
						code : "administrator note",
						summary : "Admin note. ",
						prompt : "Administrator note:"
					}
				};
			} else switch (mw.config.get('wgPageName')) {
				case 'Wikipedia:Requests_for_permissions/Rollback':
				indentation = "::";
				templateName = "subst:RFPR";
				defaultPrompt = "Admin's name?";
				responses = {
					"Done" : {
						code : "d",
						summary : "Done"
					},
					"Not done" : {
						code : "nd",
						summary : "Not done ",
						prompt : "Reason?"
					},
					"Not done (edit count)" : {
						code : "exp|$1",
						summary : "Not done: mainspace edit count too low ",
						prompt : "Number of mainspace edits?"
					},
					"Not done (recent pc)" : {
						code : "rvw",
						summary : "Not done: recently requested pending changes reviewer"
					},
					"Not done (not what for)" : {
						code : "nrb",
						summary : "Not done: not what rollback is for"
					},
					"Already done" : {
						code : "ad|$1",
						summary : "Already done "
					},
					"Revoked" : {
						code : "r",
						summary : "Revoked"
					}
				};
				break;
				case 'Wikipedia:Requests_for_permissions/Confirmed':
				indentation = "::";
				templateName = "subst:RFPC";
				responses = {
					"Done" : {
						code : "d",
						summary : "Done"
					},
					"Not done" : {
						code : "nd",
						summary : "Not done ",
						prompt : "Reason?"
					},
					"Not done (95%)" : {
						code : "nd95",
						summary : "Not done: please wait, 95% of articles are unprotected"
					},
					"Not done (no reason)" : {
						code : "ndng",
						summary : "Not done: no reason given"
					},
					"Not done (file)" : {
						code : "ndf",
						summary : "Not done: you should upload to commons or request at [[WP:FFU]]"
					},
					"Not done (no reply)" : {
						code : "ndnr",
						summary : "Not done: no response to inquiry"
					},
					"Not done (per above)" : {
						code : "ndpa",
						summary : "Not done: as explained by others"
					},
					"Not done (IP)" : {
						code : "ip",
						summary : "Not done: anonymous users cannot be granted additional rights"
					},
					"Not done (promoblock)" : {
						code : "ndpromou",
						summary : "Not done: blocked for having a promotional username"
					},
					"Question – why?" : {
						code : "why",
						summary : "Question: why do you think you are not confirmed?"
					},
					"Already done" : {
						code : "ad",
						summary : "Already done",
						id : "adc"
					},
					"Revoked" : {
						code : "r",
						summary : "Revoked"
					}
				};
				break;
				case 'Wikipedia:Requests_for_permissions/Page_mover':
				indentation = "::";
				templateName = "subst:RFPPM";
				responses = {
					"Done" : {
						code : "d",
						summary : "Done"
					},
					"Not done" : {
						code : "nd",
						summary : "Not done ",
						prompt : "Reason?"
					},
					"Not done (edit count)" : {
						code : "exp|$1",
						summary : "Not done: edit count too low ",
						prompt : "Number of total edits?"
					},
					"Not done (not what for)" : {
						code : "npm",
						summary : "Not done: not what page mover is for"
					},
					"Already done" : {
						code : "ad",
						summary : "Already done",
						id : "adc"
					},
					"Revoked" : {
						code : "r",
						summary : "Revoked"
					}
				};
				break;
				case 'Wikipedia:Requests_for_page_protection':
				case 'Wikipedia:Requests_for_page_protection/Increase':
				case 'Wikipedia:Requests_for_page_protection/Decrease':
				templateName = "subst:RFPP";
				defaultPrompt = "Duration?";
				responses = {
					"Semi-protected" : {
						code : "s|$1",
						summary : "Semi-protected "
					},
					"Pending protected" : {
						code : "pd|$1",
						summary : "Pending-changes protected "
					},
					"EC protected" : {
						code : "ec|$1",
						summary : "Extended confirmed protected "
					},
					"Fully protected" : {
						code : "p|$1",
						summary : "Fully protected "
					},
					"Move protected" : {
						code : "m|$1",
						summary : "Move protected "
					},
					"Creation protected" : {
						code : "t|$1",
						summary : "Creation protected "
					},
					"Template protected" : {
						code : "tp|$1",
						summary : "Template protected "
					},
					"Done" : {
						code : "do",
						summary : "Done"
					},
					"Already prot'd" : {
						code : "ap|$1",
						summary : "Already protected by ",
						prompt : "Admin's name?"
					},
					"Not done" : {
						code : "no",
						summary : "Not done",
						replied : "true"
					},
					"Declined" : {
						code : "d",
						summary : "Declined. ",
						prompt : "Reason?",
						replied : "true"
					},
					"Declined co" : {
						code : "co",
						summary : "Declined – likely will cause collateral damage"
					},
					"Declined not enough" : {
						code : "nea",
						summary : "Declined – not enough recent disruptive activity",
						replied : "true"
					},
					"Declined aiv" : {
						code : "aiv",
						summary : "Declined – warn user and report to [[WP:AIV|AIV]]",
						replied : "true"
					},
					"Declined preemptive" : {
						code : "np",
						summary : "Declined – pages are not protected preemptively",
						replied : "true"
					},
					"Declined not high risk" : {
						code : "nhr",
						summary : "Declined – not a high-risk template",
						replied : "true"
					},
					"Declined disp resolutio" : {
						code : "dr",
						summary : "Declined – consider dispute resolution",
						replied : "true"
					},
					"Declined user talk" : {
						code : "ut",
						summary : "Declined – user talk pages not subject to severe vandalism",
						replied : "true"
					},
					"Declined edit rate high PC" : {
						code : "her",
						summary : "Declined – edit rate too high for pending changes",
						replied : "true"
					},
					"Users blocked" : {
						code : "b",
						summary : "User(s) blocked"
					},
					"Users reblocked" : {
						code : "tb",
						summary : "User(s) re-blocked with talk page editing disallowed"
					},
					"Unprotected" : {
						code : "u",
						summary : "Unprotected"
					},
					"Not unprotected" : {
						code : "nu",
						summary : "Not unprotected",
						replied : "true"
					},
					"Already unprot'd" : {
						code : "au|$1",
						summary : "Already unprotected by ",
						prompt : "Admin's name?"
					},
					"Already done" : {
						code : "ad|$1",
						summary : "Already done by ",
						prompt : "Admin's name?"
					},
					"Checking" : {
						code : "ch",
						summary : "Checking"
					},
					"Question" : {
						code : "q",
						summary : "Question ",
						prompt : "Question:"
					},
					"Note" : {
						code : "n",
						summary : "Note ",
						prompt : "Note:"
					},
					"Archive" : {
						code : "ar",
						summary : "Request immediate archiving"
					},
					"Withdrawn" : {
						code : "w",
						summary : "Withdrawn by requestor",
						replied : "true"
					},
					"Edit warring" : {
						code : "ew",
						summary : "Consider the edit warring noticeboard",
						replied : "true"
					}
				};
				break;
				case "Wikipedia:Administrators'_noticeboard/Edit_warring":
				anew = true;
				indentation = "*";
				templateName = "AN3";
				defaultPrompt = "Duration?";
				responses = {
					"Blocked" : {
						code : "b|$1",
						summary : "Blocked "
					},
					"Nom. blocked" : {
						code : "nb|$1",
						summary : "Nominator blocked "
					},
					"Both blocked" : {
						code : "bb|$1",
						summary : "Both blocked "
					},
					"Already blocked" : {
						code : "ab",
						summary : "Already blocked"
					},
					"No violation" : {
						code : "nv",
						summary : "No violation"
					},
					"No 3RR vio" : {
						code : "nve",
						summary : "Three-revert rule not applicable"
					},
					"Stale" : {
						code : "s",
						summary : "Stale"
					},
					"Declined" : {
						code : "d",
						summary : "Declined ",
						prompt : "Reason?"
					},
					"Malformed report" : {
						code : "mr",
						summary : "Declined – malformed report"
					},
					"Not blocked" : {
						code : "not",
						summary : "Not blocked"
					},
					"Page protected" : {
						code : "p",
						summary : "Page protected"
					},
					"Page prot'd dr" : {
						code : "pe",
						summary : "Page protected – consider dispute resolution"
					},
					"Warned" : {
						code : "w",
						summary : "Warned user(s)"
					},
					"Note" : {
						code : "n",
						summary : "Note. ",
						prompt : "Note:",
						unresolved : true
					},
					"Comment" : {
						code : "c",
						summary : "Comment. ",
						prompt : "Comment:",
						unresolved : true
					}
				};
				break;
			}
		}
	}

	function respondFn(e) {
		var response = e.data.response;
		var code = response.code, comment = "", value = "", value2 = "";

		if (code.indexOf("|$1") !== -1) {
			value = prompt((response.prompt ? response.prompt : defaultPrompt) +
				       (response.valueRequired ? '' : " (optional, hit OK to omit)"));
			if (value === null) return false;
			code = code.replace('$1', value);
			if (code.indexOf("$2") !== -1) {
				value2 = prompt(response.prompt2 + (response.value2Required ? '' : " (optional, hit OK to omit)"));
				if (value2 === null) return false;
				code = code.replace('$2', value2);
			}
		} else if (response.prompt) {
			value = prompt(response.prompt + " (optional, hit OK to omit)");
			if (value === null) return false;
			if (value.length) comment = " " + value;
		}

		var $textarea = $("#wpTextbox1");
		var currentText = $textarea.val();
		var responseStr = indentation + "{{" + (templateName ? templateName + "|" : "") + code.replace(/\|$/, '') + "}}" + comment + " ~~~~";

		//Try to capture username on RFPP, offer popup on AIV
		var txt = "";
		if (templateName == "RFPP") {
			if (response.replied== "true") {
				txt = $textarea.val();
				txt = txt.match(/\=\=.*\n.*(?:\* ?\{\{pagelinks.*\n)+.*\[\[User([ _]talk)?:([\.\- \w\d]+).*\n?.*/);
				if (txt[2]) {
					txt = '; Reply to ' + txt[2];
				}
			}
		} else if (templateName == "AIV") {
			if (response.code != 'fp') {
				txtA = prompt("Who reported?");
				if (txtA && txtA !== null) txt = "; Reply to " + txtA;
			}
		}

		if (inline) {
			var caretPos = $textarea.textSelection('getCaretPosition');
			$textarea.val(currentText.substring(0, caretPos) + responseStr + currentText.substring(caretPos));
		} else if (spi) {
			$textarea.val(
				currentText.replace(/(\n----<\!---|$)/, responseStr + "\n$&")
			);
		} else {
			$textarea.val(currentText + responseStr);
		}

		if (anew && !unresolved) {
			var textArray = $textarea.val().split("\n");
			$textarea.val(
				textArray[0].replace('(Result: )','(Result: ' + (response.summary[0].toUpperCase() + response.summary.slice(1) + value).trim() + ')') +
					'\n' + $textarea.val().split("\n").splice(1).join("\n")
			);
		}

		if (response.summary.indexOf('$1') !== -1) {
			response.summary = response.summary.replace('$1', value.trim());

			if (response.summary.indexOf('$2') !== -1) {
				response.summary = response.summary.replace('$2', value2.trim());
			}
		} else {
			response.summary = response.summary + value.trim();
		}
		$("#wpSummary").val($("#wpSummary").val() + response.summary + " (using [[User:MusikAnimal/responseHelper|responseHelper]])" + txt);
	}
}());
// </nowiki></pre>
