//Modified from [[User:Animum/easyblock.js]], [[Special:PermaLink/665148625]]
//Don't make p-cactions inline for modern
//Other minor fixes and updates for compatibility

//<pre><nowiki>
/***************
 *  EasyBlock  *
 ***************
 *  By Animum  *
 ***************************************************************************************
 *  To use this script, add the following line to your monobook (or other skin) file:  *

    mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Animum/easyblock.js&action=raw&ctype=text/javascript'); //[[User:Animum/easyblock.js]]
***************************************************************************************/

/***************************************
 *  Handy-dandy block script           *
 ***************************************
 *  Authored by me except where        *
 *  otherwise noted                    *
 ***************************************
 *  This script has only been tested   *
 *  in Firefox and Google Chrome. It   *
 *  might not work in other browsers.  *
 ***************************************
 *  If something needs to be done,     *
 *  feel absolutely free to make the   *
 *  necessary edits yourself.          *
 ***************************************/

//-----------------------------------
// Libraries
//-----------------------------------
mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Amorymeltzer/easyblock-modern.css&action=raw&ctype=text/css', 'text/css');

function easyblock() {} //So we can have some sanity in the arrangement of this

easyblock.addlilink = function(tabs, href, name, id, title, key) { //By Voice of All
    var span = document.createElement('span');
    span.appendChild(document.createTextNode(name));
    var na = document.createElement('a');
    na.href = href;
    na.appendChild(span);
    na.style.cssText = 'cursor:pointer';
    na.setAttribute( 'nopopup', '1' ); //to better cooperate with WP:NAVPOP when popupOnlyArticleLinks is set to false.
    var li = document.createElement('li');
    if(id) li.id = id;
    li.appendChild(na);
    tabs.appendChild(li);
    if(id)
    {
	if(key && title)
	{
	    ta[id] = [key, title];
	}
	else if(key)
	{
	    ta[id] = [key, ''];
	}
	else if(title)
	{
	    ta[id] = ['', title];
	}
    }
    return li;
};

easyblock.addlimenu = function(tabs, name, id, href, position) { //By Voice of All
    var na, mn, span;
    var li;

    if (!id)  id = name;

    span = document.createElement("span");
    span.appendChild( document.createTextNode(name) );
    na = document.createElement("a");
    na.appendChild(span);
    na.onclick = href;
    na.style.cssText = 'cursor:pointer';
    mn = document.createElement("ul");
    li = document.createElement("li");
    li.appendChild(na);
    li.appendChild(mn);
    if (id) li.id = id;
    li.className = 'blockmenu';

    if (position) {
	tabs.insertBefore(li, position);
    } else {
	tabs.appendChild(li);
    }

    return mn;  // useful because it gives us the <ul> to add <li>s to
};

easyblock.makeMenu = function(where, id, items) {
    if(typeof(where) == 'undefined' || typeof(items) == 'undefined') return;
    if(typeof(id) == 'undefined' || id.length === 0) id = where + "-submenu";
    var ul = document.createElement("ul");
    ul.className = "blockmenu";
    ul.id = id;
    where.appendChild(ul);
    ul.style.left = "114px";
    ul.style.top = "-1px";
    ul.style.display = "none";
    for(i=0; i<items.length; i++) {
	var item = items[i];
	easyblock.addlilink(document.getElementById(id), item[0], item[1], (typeof(item[2]) != 'undefined' ? item[2] : ""));
    }
    where.onmouseover = function() {
	ul.style.display = "block";
    };
    where.onmouseout = function() {
	ul.style.display = "none";
    };
};

easyblock.zeroPad = function(str) { //By Gracenotes
    return ("0" + str).slice(-2);
};

easyblock.formatResponse = function(response) { //By Gracenotes
    try {
	response = response.query.pages;
	for (var property in response)
	    return response[property];
    } catch (e) {
	return response.query.pages[-1];
    }
};

easyblock.textUpdate = function(message, br) {
    if(typeof(br) == 'undefined') br = true;
    document.getElementById("contentSub").innerHTML += (br ? "<br />" : "") + "<b>" + message + "</b>";
};

easyblock.bgColor = function(color) {
    document.getElementById("content").style.backgroundColor = color;
};

easyblock.isIP = function(ip) { //From [[MediaWiki:Sysop.js]]
    return /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/.test(ip);
};

easyblock.isSensitive = function(address) { //From [[MediaWiki:Sysop.js]]
    ips = Array(
	Array(/\b63\.162\.143\.21\b/),
	Array(/\b82\.148\.9(6\.68|7\.69)\b/),
	Array(/\b128\.183\.103\.97\b/),
	Array(/\b(((2|5)?6|7|[12]1|2(2|8|9)|3(0|3)|55)\.([01]?\d\d?|2(5[0-5]|[0-4]\d))|130\.22)(\.([01]?\d\d?|2(5[0-5]|[0-4]\d))){2}\b/),
	Array(/\b138\.16[23](\.([01]?\d\d?|2(5[0-5]|[0-4]\d))){2}\b/),
	Array(/\b143\.2(2[89]|3[01])(\.([01]?\d\d?|2(5[0-5]|[0-4]\d))){2}\b/),
	Array(/\b149\.101(\.([01]?\d\d?|2(5[0-5]|[0-4]\d))){2}\b/),
	Array(/\b156\.33(\.([01]?\d\d?|2(5[0-5]|[0-4]\d))){2}\b/),
	Array(/\b(162\.4[56]\.([01]?\d\d?|2(5[0-5]|[0-4]\d))|198\.81\.(128|129|1[3-8]\d|191))\.([01]?\d\d?|2(5[0-5]|[0-4]\d))\b/),
	Array(/\b192\.197\.(7[7-9]|8[0-6])\.([01]?\d\d?|2(5[0-5]|[0-4]\d))\b/),
	Array(/\b(51(\.([01]?\d\d?|2(5[0-5]|[0-4]\d))){2}|194.60.\d[0-5]?)\.([01]?\d\d?|2(5[0-5]|[0-4]\d))\b/),
	Array(/\b66\.230\.(19[2-9]|2[0-3]\d)\.([01]?\d\d?|2(5[0-5]|[0-4]\d))\b/),
	Array(/\b91\.198\.174\.(19[2-9]|2([01]\d|2[0-3]))\b/)
    );
    ip = address;
    if (this.isIP(ip)) {
	for (i = 0; i < ips.length; i++) {
	    if (ip.match(ips[i][0])) {
		return true;
	    } else {
		return false;
	    }
	}
    }
};

easyblock.canShowOn = function(where) { //For reading the ebPrefs.showOnPages data
    return (ebPrefs.showOnPages.indexOf(where) != -1 ? true : false);
};

easyblock.syncAjaxGet = function(queryString)
{
    var result;
    jQuery.ajax({
	url: mw.config.get('wgScriptPath') + "/api.php?" + queryString,
	async: false,
	dataType: "json",
	success : function(data) { result = data; }
    });
    return result;
};

easyblock.syncAjaxPost = function(postData)
{
    var result;
    jQuery.ajax({
	url: mw.config.get('wgScriptPath') + "/api.php",
	async: false,
	type: "POST",
	data: postData,
	dataType: "json",
	success : function(data) { result = data; }
    });
    return result;
};

easyblock.asyncAjaxPost = function(postData, successFunction)
{
    jQuery.ajax({
	url: mw.config.get('wgScriptPath') + "/api.php",
	type: "POST",
	data: postData,
	dataType: "json",
	success : successFunction
    });
};

easyblock.isBlocked = function(name) {
    var info = this.syncAjaxGet("action=query&list=blocks&bkusers=" + name + "&format=json");
    if (info.error) return false; //this can happen with syntactically invalid input, like IP CIDR ranges used by User:Splarka/contribsrange.js
    return (info.query.blocks[0] ? true : false);
};

easyblock.getLastBlock = function(user) {
    var response = this.syncAjaxGet("format=json&action=query&list=logevents&letype=block&letitle=User:" + encodeURIComponent(user) + "&leprop=details");
    if(response && response.query && response.query.logevents)
    {
	//look for the most recent block log entry that isn't an unblock. We can't filter for both blocks and reblocks, apparently.
	for (var i=0; i<response.query.logevents.length; i++)
	{
	    if(response.query.logevents[i].params)
	    {
		var duration = response && response.query && response.query.logevents[i].params.duration;
		return (this.isBlocked(user) ? "blocked" : "last") + ": " + duration;
	    }
	}
    }
    return "not blocked before";
};
//-----------------------------------
// End
//-----------------------------------

//-----------------------------------
// Preferences
//-----------------------------------
if(typeof(ebPrefs) == 'undefined') {
    ebPrefs = {};
}

if(typeof(ebPrefs.markWarnAsMinor) == 'undefined' || ebPrefs.markWarnAsMinor == 1) {
    ebPrefs.markWarnAsMinor = true;
}

if(typeof(ebPrefs.showOnPages) == 'undefined') {
    ebPrefs.showOnPages = ["user_usertalk", "contribs", "diffs", "ipblocklist", "blockip", "undelete"];
}

if(typeof(ebPrefs.useAutoWarn) == 'undefined') {
    ebPrefs.useAutoWarn = true;
}

if(typeof(ebPrefs.loadPageOnSubmit) == 'undefined') {
    ebPrefs.loadPageOnSubmit = (typeof ebPrefs.loadCommentOnSubmit == "undefined" ? true : ebPrefs.loadCommentOnSubmit);
}

if(typeof(ebPrefs.displayStatus) == 'undefined') {
    ebPrefs.displayStatus = true;
}

if(typeof(ebPrefs.watchlistEnabled) == 'undefined') {
    ebPrefs.watchlistEnabled = false;
}

if(typeof(ebPrefs.showOnClick) == 'undefined') {
    ebPrefs.showOnClick = false;
}

if(typeof(ebPrefs.returnTo) == 'undefined') {
    ebPrefs.returnTo = "";
}
//-----------------------------------
// End
//-----------------------------------

//-----------------------------------
// Warn and block functions
// (The heart and muscle of the script)
//-----------------------------------
easyblock.edit = function(page, comment, summary, replacePage, loadPageOnSubmit) {
    if(typeof(loadPageOnSubmit) == 'undefined') loadPageOnSubmit = true;
    if(typeof(replacePage) == 'undefined') replacePage = false;
    page = decodeURIComponent(page);

    if(ebPrefs.dislayStatus) this.textUpdate("Adding \"" + comment + "\" to <a href=\"/wiki/" + encodeURIComponent(page) + "\">" + page + "</a>...");

    var rawResponse = this.syncAjaxGet("action=query&prop=info|revisions&format=json&meta=tokens&type=csrf&rvprop=content|timestamp&titles=" + encodeURIComponent(page));
    var info = this.formatResponse(rawResponse);
    // This would be better with curtimestamp
    var date = new Date();
    var startTime = date.getUTCFullYear() + this.zeroPad(date.getUTCMonth() + 1) + this.zeroPad(date.getUTCDate()) + this.zeroPad(date.getUTCHours()) + this.zeroPad(date.getUTCMinutes()) + this.zeroPad(date.getUTCSeconds());
    var editTime = (info.revisions ? info.revisions[0].timestamp.replace(/[^0-9]/g, "") : startTime);
    var content = (info.revisions ? (info.revisions[0]["*"].length > 0 ? info.revisions[0]["*"] : "") : "");
    var editToken = rawResponse.query.tokens.csrftoken;

    var postdata = "format=json"
	+ "&action=edit"
	+ "&title=" + encodeURIComponent(page)
	+ (replacePage ? "&text=" : "&appendtext=") + encodeURIComponent((!replacePage ? "\n\n" : "") + comment)
	+ "&summary=" + encodeURIComponent(summary)
	+ "&token=" + encodeURIComponent(editToken)
	+ "&basetimestamp=" + editTime
	+ "&starttimestamp=" + startTime
	+ (ebPrefs.markWarnAsMinor ? "&minor=" : "&notminor=")
	+ (ebPrefs.watchlistEnabled ? "&watch=" : "");

    this.asyncAjaxPost(postdata, function(responseObject) {
	if(responseObject.edit) {
	    easyblock.bgColor("#EEF"); //We're done.
	    if(ebPrefs.displayStatus) easyblock.textUpdate(" done!", false);
	    if(loadPageOnSubmit && ebPrefs.loadPageOnSubmit) {
		window.setTimeout(function() { location.href = mw.config.get('wgScript') + "?title=" + (ebPrefs.returnTo.length > 0 ? ebPrefs.returnTo : encodeURIComponent(page)); }, 2000);
	    }
	} else {
	    easyblock.textUpdate("Error: " + responseObject.error.info);
	}
    });
};

easyblock.warnAndTag = function(page, comment, summary, replacePage, page2, comment2, summary2, replacePage2) {
    this.edit(page, comment, summary, replacePage, false);
    this.edit(page2, comment2, summary2, replacePage2);
};

easyblock.block = function(name, reason, duration, autoblock, nocreate, noemail, allowusertalk, anononly) {
    //Safeguards against errors
    if(this.isBlocked(name)) {
	document.getElementById("contentSub").innerHTML += "<br />";
	this.textUpdate("Error:  " + name + " is already blocked. (<a href=\"/w/index.php?title=Special:BlockList&action=unblock&ip=" + encodeURIComponent(name) + "\">unblock</a>)");
	return;
    }
    if(this.isSensitive(name)) {
	document.getElementById("contentSub").innerHTML += "<br />";
	this.textUpdate("Aborting:  " + name + " is marked as a sensitive address.");
	return;
    }
    if(typeof(name) == "undefined" || name == "undefined" || name === "") {
	document.getElementById("contentSub").innerHTML += "<br />";
	this.textUpdate("Error:  No username was specified; please block manually.  If this problem persists across many pages, <a href=\"/w/index.php?title=User_talk:Animum&action=edit&section=new\">contact</a> Animum.");
	return;
    }
    if(name == mw.config.get('wgUserName')) {
	var confirmBlock = confirm("Do you really want to block yourself?\n\n(Click \"Yes\" to proceed, \"no\" to abort.)");
	if(!confirmBlock) {
	    this.textUpdate("Aborted.");
	    return;
	}
    }
    if(!reason) {
	document.getElementById("contentSub").innerHTML += "<br />";
	this.textUpdate("Error:  No reason was specified; please block manually.  If this problem persists across many pages, <a href=\"/w/index.php?title=User_talk:Animum&action=edit&section=new\">contact</a> Animum.");
	return;
    }
    if(!duration && reason.indexOf("sockpuppet") == -1) {
	document.getElementById("contentSub").innerHTML += "<br />";
	this.textUpdate("Error:  No duration was specified; please block manually.  If this problem persists across many pages, <a href=\"/w/index.php?title=User_talk:Animum&action=edit&section=new\">contact</a> Animum.");
	return;
    }
    //If none of these safeguards have been triggered, continue.
    if(ebPrefs.displayStatus) document.getElementById("contentSub").innerHTML += "<br />";
    this.bgColor("#EFE"); //Begin.

    var responseObject = this.syncAjaxPost("format=json&action=query&meta=tokens&type=csrf");
    var edittoken = responseObject.query.tokens.csrftoken;

    var isIP = this.isIP(name);
    if(reason.indexOf("sockpuppet") != -1) {
	sockof = prompt("Name of master account:");
	if(!sockof) return;
	duration = prompt("Duration (leave blank " + (isIP ? "to cancel" : "for \"indefinite\"") + "):");
	if(!duration) {
	    if(isIP) { //Abort if no duration and user is IP
		return;
	    } else { //Set duration to indefinite if no duration and user is registered
		duration = "indefinite";
	    }
	}
	reason = (reason.indexOf("confirmed") != -1 ? "Confirmed" : "Suspected") + " \[\[Wikipedia:Sock puppetry\|sock puppet\]\] of \[\[User:" + sockof + "\|" + sockof + "\]\]" + (reason.indexOf("confirmed") != -1 ? " (\[\[Wikipedia:Sockpuppet investigations/" + sockof + "\|investigation\]\])" : "");
    }
    if(/(Edit war|3RR)/.test(reason)) {
	var article = prompt("Article (without brackets; leave blank to omit):");
	if(article) { //If "Cancel" were not pressed...
	    if(article.length > 0) reason += " on [[" + article + "]]"; //...And if a string were entered before "OK" was pressed, add the article to the reason
	}
    }
    /* Set the default values:
     * Account creation: disabled
     * Autoblock:        enabled (for blocks of registered users only)
     * Anon-only:        enabled (for blocks of IPs only)
     * Allow e-mail:     enabled
     * Allow talk page:  enabled
     */
    nocreate = (typeof nocreate == "undefined" ? true : nocreate);
    autoblock = (typeof autoblock == "undefined" ? true : autoblock);
    anononly = (typeof anononly == "undefined" ? true : anononly);
    noemail = (typeof noemail == "undefined" ? false : noemail);
    allowusertalk = (typeof allowusertalk == "undefined" ? true : allowusertalk);


    var postdata = "format=json"
	+ "&action=block"
	+ "&user=" + encodeURIComponent(name)
	+ "&expiry=" + encodeURIComponent(duration)
	+ "&reason=" + encodeURIComponent(reason)
	+ "&token=" + encodeURIComponent(edittoken)
	+ (nocreate ? "&nocreate=" : "")
	+ (isIP ? (anononly ? "&anononly=" : "") : (autoblock ? "&autoblock=" : ""))
	+ (allowusertalk ? "&allowusertalk=" : "")
	+ (noemail ? "&noemail=" : "");
    if(typeof(confirmBlock) == 'undefined' && name == mw.config.get('wgUserName')) return; //Something weird (see [[User talk:Animum/Archives/2009/October#easyblock]])

    this.asyncAjaxPost(postdata, function(responseObject) {
	if(responseObject.block) { //If the block is successful
	    if(ebPrefs.useAutoWarn) {
		if(ebPrefs.displayStatus) easyblock.textUpdate(name + " has been blocked.");
		if(reason.indexOf("sock puppet") != -1) {
		    easyblock.warnAndTag("User talk:" + name, "\{\{subst\:sockblock\|sig=yes|master=" + sockof + "\}\}", "You are" + (reason.indexOf("Suspected") != -1 ? " suspected of being" : "") + " a sockpuppet of \[\[User\:" + sockof + "\|" + sockof + "\]\] and have been blocked " + (duration == "indefinite" ? "indefinitely" : "for " + duration) + ".", false, "User:" + name, (reason.indexOf("Suspected") != -1 ? "\{\{sockpuppet\|" + sockof + "\|blocked\}\}" : "\{\{CheckedSockpuppet\|" + sockof + "\|" + sockof + "\}\}"), "You are" + (reason.indexOf("Suspected") != -1 ? " suspected of being" : "") + " a sockpuppet of \[\[User\:" + sockof + "\|" + sockof + "\]\] and have been blocked " + (duration == "indefinite" ? "indefinitely" : "for " + duration) + ".", true);
		}
		if(reason == "[[WP:Vandalism|Vandalism]]") {
		    easyblock.edit("User talk:" + name, "\{\{subst\:uw-vblock\|time=" + duration + "\|subst\=subst\:\|sig\=y\}\}", "Due to recent \[\[Wikipedia\:Vandalism\|vandalism\]\] from this " + (isIP ? "IP address" : "account") + ", it has been blocked for " + duration + ".");
		}
		if(reason == "{{uw-ublock}}" && !isIP) {
		    easyblock.edit("User talk:" + name, "\{\{subst:uw-ublock\|sig\=y\|subst\=subst\:\}\}", "You have been blocked for a violation of the \[\[Wikipedia\:Username policy\|username policy\]\].");
		}
		if(reason == "{{uw-softerblock}}" && !isIP) {
		    easyblock.edit("User talk:" + name, "\{\{subst:uw-softerblock\|sig\=y\|subst\=subst\:\}\}", "You have been blocked for a violation of the \[\[Wikipedia\:Username policy\|username policy\]\].");
		}
		if(reason == "{{uw-causeblock}}" && !isIP) {
		    easyblock.edit("User talk:" + name, "\{\{subst:uw-causeblock\|sig\=y\|subst\=subst\:\}\}", "You have been blocked for a violation of the \[\[Wikipedia\:Username policy\|username policy\]\].");
		}
		if(reason == "{{uw-uhblock}}" && !isIP) {
		    easyblock.edit("User talk:" + name, "\{\{subst:uw-uhblock\|sig\=y\|subst\=subst\:\}\}", "You have been blocked for a blatant violation of the \[\[Wikipedia\:Username policy\|username policy\]\].");
		}
		if(reason == "{{uw-spamublock}}" && !isIP) {
		    easyblock.edit("User talk:" + name, "\{\{subst:uw-spamublock\|sig\=y\|subst\=subst\:\}\}", "You have been blocked because your username seems to exist only to promote a corporation or group.");
		}
		if(reason == "{{uw-botublock}}" && !isIP) {
		    easyblock.edit("User talk:" + name, "\{\{subst:uw-botublock\|sig\=y\|subst\=subst\:\}\}", "You have been blocked for a violation of the \[\[Wikipedia\:Username policy\|username policy\]\].");
		}
		if(reason == "{{uw-vaublock}}" && !isIP) {
		    easyblock.edit("User talk:" + name, "\{\{subst:uw-vaublock\|sig\=y\|subst\=subst\:\}\}", "Due to vandalism and this account's name, it has been blocked indefinitely.");
		}
		if(reason == "{{schoolblock}}" && isIP) {
		    easyblock.edit("User talk:" + name, "\{\{schoolblock\|1\=Blocked for " + duration + ".\|sig\=\~\~\~\~}\}", "Due to extensive vandalism from this school's IP address, it has been blocked for " + duration + ".", false);
		}
		if(reason == "{{anonblock}}" && isIP) {
		    easyblock.edit("User talk:" + name, "\{\{anonblock\|1\=Blocked for " + duration + ".\|sig\=\~\~\~\~}\}", "Due to extensive vandalism from this IP address, it has been blocked for " + duration + ".");
		}
		if(reason == "[[WP:Vandalism|Vandalism]]-only account" && !isIP) {
		    easyblock.edit("User talk:" + name, "\{\{subst\:uw-voablock\|subst\=subst\:\|sig\=y\}\}", "You have been blocked indefinitely because your account is being used only for \[\[Wikipedia\:Vandalism\|vandalism\]\].");
		}
		if(reason == "[[WP:No personal attacks|Personal attacks]] or [[WP:Harassment|harassment]]") {
		    easyblock.edit("User talk:" + name, "\{\{subst\:uw-hblock\|" + (duration == "indefinite" ? "indef\=yes" : "time\=" + duration) + "\|subst\=subst\:\|sig\=y\}\}", "You have been blocked for harassing or attempting to harass other users.");
		}
		if(reason == "[[WP:Spam|Spamming]] links to external sites") {
		    easyblock.edit("User talk:" + name, "\{\{subst\:uw-sblock\|" + (duration == "indefinite" ? "indef\=yes" : "time\=" + duration) + "\|subst\=subst\:\|sig\=y\}\}", "You have been blocked for adding [[WP:Spam|spam]] links to external sites.");
		}
		if(reason == "[[WP:Advertising|Advertising]]") {
		    easyblock.edit("User talk:" + name, "\{\{subst\:uw-adblock\|" + (duration == "indefinite" ? "indef\=yes" : "time\=" + duration) + "\|subst\=subst\:\|sig\=y\}\}", "You have been blocked for using Wikipedia to advertise.");
		}
		if(reason.indexOf("[[WP:Edit war|Edit warring]]") != -1) { //Could possibly contain "on [[foo]]"
		    easyblock.edit("User talk:" + name, "\{\{subst\:uw-ewblock" + (reason.indexOf(" on ") != -1 ? "\|1=" + article : "") + "\|time=" + duration + "\|subst\=subst\:\|sig\=y\}\}", "You have been blocked for \[\[Wikipedia\:EW\|edit-warring\]\].");
		}
		if(reason.indexOf("[[WP:3RR|3RR]] violation") != -1) { //Same as above
		    easyblock.edit("User talk:" + name, "\{\{subst\:uw-3block" + (reason.indexOf(" on ") != -1 ? "\|1=" + article : "") + "\|time=" + duration + "\|subst\=subst\:\|sig\=y\}\}", "You have been blocked for a violation of the \[\[Wikipedia\:3RR\|three-revert rule\]\].");
		}
		if(reason == "[[WP:Long term abuse|Long-term abuse]]") {
		    easyblock.bgColor("#EEF");
		    if(ebPrefs.displayStatus) easyblock.textUpdate(name + " has been blocked.");
		    if(ebPrefs.loadPageOnSubmit) location.href = mw.config.get('wgScript') + "?title=" + (ebPrefs.returnTo.length > 0 ? ebPrefs.returnTo : encodeURIComponent("User talk:" + name));
		}
	    } else {
		easyblock.bgColor("#EEF");
		if(ebPrefs.displayStatus) easyblock.textUpdate(name + " has been blocked.");
		if(ebPrefs.loadPageOnSubmit) location.href = mw.config.get('wgScript') + "?title=" + (ebPrefs.returnTo.length > 0 ? ebPrefs.returnTo :  encodeURIComponent("User talk:" + name));
	    }
	} else { //An error has occurred.
	    easyblock.textUpdate("Error: " + responseObject.error.info);
	    easyblock.bgColor("#EEF"); //We're done.
	}
    });
}
//-----------------------------------
// End
//-----------------------------------

//-----------------------------------
// Tab displayer
//-----------------------------------
easyblock.showTab = function() {
    var target;
    if(mw.config.get('wgNamespaceNumber') == 2 || mw.config.get('wgNamespaceNumber') == 3) {
	if(mw.config.get('wgTitle').indexOf('/') != -1) {
	    target = mw.config.get('wgTitle').split('/')[0];
	} else {
	    target = mw.config.get('wgTitle');
	}
    }

    /* Diffs can be so temperamental */
    if(mw.config.get('wgDiffNewId')) { //Sufficient for determining we're in a diff, see [[phab:T214985]]
	target = $('#mw-diff-ntitle2').find('a').first().text();
    }

    if(mw.config.get('wgCanonicalSpecialPageName') == "Ipblocklist" && window.location.href.indexOf("&action=success&successip=") != -1) {
	target = decodeURIComponent(mw.util.getParamValue("successip").replace(/\+/g, " "));
    }

    if(mw.config.get('wgCanonicalSpecialPageName') == "Contributions" && document.getElementsByName("target")[0].value.length > 0) {
	target = document.getElementsByName("target")[0].value;
    }

    if(mw.config.get('wgCanonicalSpecialPageName') == "Undelete" && mw.config.get('wgRelevantUserName')) {
	target = mw.config.get('wgRelevantUserName');
    }

    if(mw.config.get('wgCanonicalSpecialPageName') == "Blockip" && window.location.href.indexOf("&action=success") == -1) {
	target = document.forms["blockip"].elements["wpBlockAddress"].value;
    }

    if(((mw.config.get('wgNamespaceNumber') == 2 || mw.config.get('wgNamespaceNumber') == 3) && this.canShowOn("user_usertalk")) || (mw.config.get('wgDiffNewId') && this.canShowOn("diffs")) || (mw.config.get('wgCanonicalSpecialPageName') == "Contributions" && this.canShowOn("contribs") && document.getElementsByName("target")[0].value.length > 0) || (mw.config.get('wgCanonicalSpecialPageName') == "Blockip" && this.canShowOn("blockip")) || (window.location.href.indexOf("Special:BlockList&action=success&successip=") != -1 && this.canShowOn("ipblocklist")) || (mw.config.get('wgCanonicalSpecialPageName') == "Undelete" && target && this.canShowOn("Undelete"))) {
	if((mw.config.get('wgCanonicalSpecialPageName') == "Blockip" && (window.location.href.indexOf("&action=success") != -1 || document.forms["blockip"].elements["wpBlockAddress"].value.length == 0)) || (mw.config.get('wgCanonicalSpecialPageName') == "Ipblocklist" && target.indexOf("#") != -1)) {
	    return;
	} else {
	    var encodedTarget = encodeURIComponent(target.replace(/ /g, "_"));
	    target = target.replace(/_/g, " ").replace('"', '\\"');
	    this.addlimenu(document.getElementById('p-cactions').getElementsByTagName('ul')[0], 'Block', 'blockoptions', '');
	    //document.getElementById('p-cactions').style.display = "inline"; //required when p-cactions is empty, not harmful if already visible
	    var blockoptions = document.getElementById('blockoptions').getElementsByTagName('ul')[0];
	    this.addlilink(blockoptions, "/w/index.php?title=Special:Log&page=User:" + encodedTarget + "&type=block", this.getLastBlock(target), "");
	    this.addlilink(blockoptions, "#", "vandalism »", "ca-vandalblock");
	    this.makeMenu(document.getElementById("ca-vandalblock"), "vandalblock-list", new Array(
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Vandalism|Vandalism\]\]\", \"24 hours\")", "V+24 hours"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Vandalism|Vandalism\]\]\", \"31 hours\")", "V+31 hours"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Vandalism|Vandalism\]\]\", \"48 hours\")", "V+48 hours"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Vandalism|Vandalism\]\]\", \"3 days\")", "V+3 days"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Vandalism|Vandalism\]\]\", \"1 week\")", "V+1 week"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Vandalism|Vandalism\]\]\", \"2 weeks\")", "V+2 weeks"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Vandalism|Vandalism\]\]\", \"1 month\")", "V+1 month"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Vandalism|Vandalism\]\]\", \"3 months\")", "V+3 months"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Vandalism|Vandalism\]\]\", \"6 months\")", "V+6 months"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Vandalism|Vandalism\]\]\", \"1 year\")", "V+1 year"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Vandalism|Vandalism\]\]\", \"2 years\")", "V+2 years"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{uw-vaublock\}\}\", \"indefinite\")", "Vau+indefinite"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Vandalism|Vandalism\]\]\-only account\", \"indefinite\")", "Voa+indefinite"]
	    ));
	    this.addlilink(blockoptions, "#", "schoolblock »", "ca-schoolblock");
	    this.makeMenu(document.getElementById("ca-schoolblock"), "schoolblock-list", new Array(
		["javascript:easyblock.block(\"" + target + "\", \"\{\{schoolblock\}\}\", \"1 week\")", "school+1 week"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{schoolblock\}\}\", \"2 weeks\")", "school+2 weeks"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{schoolblock\}\}\", \"1 month\")", "school+1 month"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{schoolblock\}\}\", \"3 months\")", "school+3 months"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{schoolblock\}\}\", \"6 months\")", "school+6 months"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{schoolblock\}\}\", \"1 year\")", "school+1 year"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{schoolblock\}\}\", \"2 years\")", "school+2 years"]
	    ));
	    this.addlilink(blockoptions, "#", "anonblock »", "ca-anonblock");
	    this.makeMenu(document.getElementById("ca-anonblock"), "anonblock-list", new Array(
		["javascript:easyblock.block(\"" + target + "\", \"\{\{anonblock\}\}\", \"1 week\")", "anon+1 week"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{anonblock\}\}\", \"2 weeks\")", "anon+2 weeks"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{anonblock\}\}\", \"1 month\")", "anon+1 month"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{anonblock\}\}\", \"3 months\")", "anon+3 months"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{anonblock\}\}\", \"6 months\")", "anon+6 months"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{anonblock\}\}\", \"1 year\")", "anon+1 year"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{anonblock\}\}\", \"2 years\")", "anon+2 years"]
	    ));
	    this.addlilink(blockoptions, "#", "username »", "ca-usernameblock");
	    this.makeMenu(document.getElementById("ca-usernameblock"), "usernameblock-list", new Array(
		["javascript:easyblock.block(\"" + target + "\", \"\{\{uw-ublock\}\}\", \"indefinite\", false, false)", "Name+indefinite"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{uw-softerblock\}\}\", \"indefinite\", false, false)", "Promosofter+indefinite"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{uw-causeblock\}\}\", \"indefinite\", false, false)", "Causeblock+indefinite"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{uw-uhblock\}\}\", \"indefinite\")", "Hardname+indefinite"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{uw-spamublock\}\}\", \"indefinite\")", "Spamname+indefinite"],
		["javascript:easyblock.block(\"" + target + "\", \"\{\{uw-botublock\}\}\", \"indefinite\", false, false)", "Botname+indefinite"]
	    ));
	    this.addlilink(blockoptions, "#", "spam »", "ca-spamblock");
	    this.makeMenu(document.getElementById("ca-spamblock"), "spamblock-list", new Array(
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Spam\|Spamming\]\] links to external sites\", \"1 day\")", "spam+1 day"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Spam\|Spamming\]\] links to external sites\", \"3 days\")", "spam+3 days"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Spam\|Spamming\]\] links to external sites\", \"1 week\")", "spam+1 week"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Spam\|Spamming\]\] links to external sites\", \"2 weeks\")", "spam+2 weeks"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Spam\|Spamming\]\] links to external sites\", \"1 month\")", "spam+1 month"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Spam\|Spamming\]\] links to external sites\", \"3 months\")", "spam+3 months"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Spam\|Spamming\]\] links to external sites\", \"6 months\")", "spam+6 months"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Spam\|Spamming\]\] links to external sites\", \"1 year\")", "spam+1 year"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Spam\|Spamming\]\] links to external sites\", \"indefinite\")", "spam+indef"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Spam\|Spamming\]\] links to external sites\", \"indefinite\", true, true, false, false)", "spam+indef+notalk"]
	    ));
	    this.addlilink(blockoptions, "#", "advertising »", "ca-adblock");
	    this.makeMenu(document.getElementById("ca-adblock"), "adblock-list", new Array(
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Advertising|Advertising\]\]\", \"1 day\")", "ad+1 day"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Advertising|Advertising\]\]\", \"3 days\")", "ad+3 days"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Advertising|Advertising\]\]\", \"1 week\")", "ad+1 week"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Advertising|Advertising\]\]\", \"2 weeks\")", "ad+2 weeks"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Advertising|Advertising\]\]\", \"1 month\")", "ad+1 month"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Advertising|Advertising\]\]\", \"3 months\")", "ad+3 months"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Advertising|Advertising\]\]\", \"6 months\")", "ad+6 months"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Advertising|Advertising\]\]\", \"1 year\")", "ad+1 year"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Advertising|Advertising\]\]\", \"indefinite\")", "ad+indef"]
	    ));
	    this.addlilink(blockoptions, "#", "npa »", "ca-npablock");
	    this.makeMenu(document.getElementById("ca-npablock"), "npablock-list", new Array(
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:No personal attacks\|Personal attacks\]\] or \[\[WP:Harassment\|harassment\]\]\", \"1 day\")", "npa+1 day"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:No personal attacks\|Personal attacks\]\] or \[\[WP:Harassment\|harassment\]\]\", \"3 days\")", "npa+3 days"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:No personal attacks\|Personal attacks\]\] or \[\[WP:Harassment\|harassment\]\]\", \"1 week\")", "npa+1 week"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:No personal attacks\|Personal attacks\]\] or \[\[WP:Harassment\|harassment\]\]\", \"2 weeks\")", "npa+2 weeks"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:No personal attacks\|Personal attacks\]\] or \[\[WP:Harassment\|harassment\]\]\", \"1 month\")", "npa+1 month"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:No personal attacks\|Personal attacks\]\] or \[\[WP:Harassment\|harassment\]\]\", \"3 months\")", "npa+3 months"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:No personal attacks\|Personal attacks\]\] or \[\[WP:Harassment\|harassment\]\]\", \"6 months\")", "npa+6 months"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:No personal attacks\|Personal attacks\]\] or \[\[WP:Harassment\|harassment\]\]\", \"1 year\")", "npa+1 year"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:No personal attacks\|Personal attacks\]\] or \[\[WP:Harassment\|harassment\]\]\", \"indefinite\")", "npa+indef"]
	    ));
	    this.addlilink(blockoptions, "#", "sockpuppet »", "ca-sockblock");
	    this.makeMenu(document.getElementById("ca-sockblock"), "sockblock-list", new Array(
		["javascript:easyblock.block(\"" + target + "\", \"sockpuppet\", \"\")", "suspectedsock"],
		["javascript:easyblock.block(\"" + target + "\", \"confirmedsockpuppet\", \"\")", "confirmedsock"]
	    ));
	    this.addlilink(blockoptions, "#", "edit war & 3RR »", "ca-ewblock");
	    this.makeMenu(document.getElementById("ca-ewblock"), "ewblock-list", new Array(
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Edit war|Edit-warring\]\]\", \"24 hours\")", "EW+24 hours"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Edit war|Edit-warring\]\]\", \"31 hours\")", "EW+31 hours"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Edit war|Edit-warring\]\]\", \"48 hours\")", "EW+48 hours"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Edit war|Edit-warring\]\]\", \"3 days\")", "EW+3 days"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:Edit war|Edit-warring\]\]\", \"1 week\")", "EW+1 week"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:3RR|3RR\]\] violation\", \"24 hours\")", "3rr+24 hours"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:3RR|3RR\]\] violation\", \"31 hours\")", "3rr+31 hours"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:3RR|3RR\]\] violation\", \"48 hours\")", "3rr+48 hours"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:3RR|3RR\]\] violation\", \"3 days\")", "3rr+3 days"],
		["javascript:easyblock.block(\"" + target + "\", \"\[\[WP:3RR|3RR\]\] violation\", \"1 week\")", "3rr+1 week"]
	    ));
	    this.addlilink(blockoptions, "javascript:easyblock.block(\"" + target + "\", \"[[WP:Long term abuse|Long-term abuse]]\", \"indefinite\", true, true, true, false)", "lta+indef");
	    this.addlilink(blockoptions, "/wiki/Special:Block/" + encodedTarget, 'custom block');
	    if(ebPrefs.showOnClick) {
		var items = document.querySelectorAll("li.blockmenu")[0].getElementsByTagName("ul")[0];
		items.style.display = "none";
		document.getElementById("blockoptions").onclick = function() {
		    items.style.display = (items.style.display == "block" ? "none" : "block");
		}
	    }
	}
    }
}

function ebShowTab() { //Hacking so that the parent of easyblock.showTab is "easyblock" rather than "window"
    mw.loader.using(['mediawiki.util'], function() {
	easyblock.showTab();
    });
}

if(mw.config.get("wgUserGroups").indexOf("sysop") != -1) { //Is the user a sysop?
    jQuery(ebShowTab); //If so, display the tab.
}
//-----------------------------------
// End
//-----------------------------------
//</nowiki></pre>
