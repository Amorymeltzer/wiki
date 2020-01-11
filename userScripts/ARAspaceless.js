//Taken from [[User:TheJJJunk/ARA.js]] at [[Special:PermaLink/813306638]]
//Modified to remove "whitespace in citation" errors
// <nowiki>
// Everything is encapsulated in a private namespace object---``JJJ'':
var JJJ = JJJ || {};

$(document).ready(function()
		  {
		      //initialize Constants
		      JJJ.Constants = getARAConstants();

		      //only execute on the edit page
		      if (!JJJ.Constants.IS_EDIT_PAGE || JJJ.Constants.IS_JS_PAGE || JJJ.Constants.ARTICLE_TEXT_BOX_ELEMENT == null)
			  return;

		      //init functions and rules
		      JJJ.Functions = getARAFunctions();
		      JJJ.Rules     = getARARules();

		      //init UI
		      $('#editform').prepend(JJJ.Constants.SUGGESTION_BOX_DIV);
		      $('#wpSummaryLabel').prepend(JJJ.Constants.ADD_TO_SUMMARY_DIV);

		      JJJ.Functions.scan();                                   //init scan now
		      JJJ.Functions.observeWikiText(JJJ.Constants.delayScan); // ... and every time the user pauses typing
		  });

function getARAConstants()
{
    var ARA_Constants = ARA_Constants || {};

    //article text box element
    ARA_Constants.ARTICLE_TEXT_BOX_ELEMENT = $("#wpTextbox1");

    //are we on an Edit page?
    ARA_Constants.IS_EDIT_PAGE = mw.config.get('wgAction') === 'edit' || mw.config.get('wgAction') === 'submit';

    //are we on a JS page?
    ARA_Constants.IS_JS_PAGE = mw.config.get('wgRelevantPageName').endsWith('.js');

    //the ARA Suggestion box, which appears above the editing section
    ARA_Constants.SUGGESTION_BOX_DIV = $('<div>', {'id':'suggestionBox.ARA', 'style':'border:dashed #ccc 1px;color:#888;'});

    //the Add to Summary box, which appears near the edit summary
    ARA_Constants.ADD_TO_SUMMARY_DIV = $('<div>', {'id':'addToSummaryBox.ARA', 'style':'border:dashed #ccc 1px;color:#888;display:none;'});

    ARA_Constants.DEFAULT_MAX_SUGGESTIONS = 8;
    ARA_Constants.maxSuggestions = ARA_Constants.DEFAULT_MAX_SUGGESTIONS;
    ARA_Constants.suggestions; // : Suggestion[]
    ARA_Constants.appliedSuggestions = {}; // : Map<String, int>

    ARA_Constants.scannedText = null; // remember what we scan, to check if it is
    // still the same when we try to fix it

    ARA_Constants.BIG_THRESHOLD = 100 * 1024;
    ARA_Constants.isBigScanConfirmed = false; // is the warning about a big article confirmed
    ARA_Constants.isTalkPageScanConfirmed = false;

    ARA_Constants.scanTimeoutId = null; // a timeout is set after a keystroke and before
    // a scan, this variable tracks its id

    return ARA_Constants;
}

function getARAFunctions()
{
    var ARA_Functions = ARA_Functions || {};

    // Browsers offer means to highlight text between two given offsets (``start''
    // and ``end'') in a textarea, but some of them do not automatically scroll to it.
    // This function is an attempt to simulate cross-browser selection and scrolling.
    ARA_Functions.setSelectionRange = function (ta, start, end) {
	// Initialise static variables used within this function
	var _static = arguments.callee; // this is the Function we are in.  It will be used as a poor man's function-local static scope.
	if (ta.setSelectionRange) {
	    // Guess the vertical scroll offset by creating a
	    // separate hidden clone of the original textarea, filling it with the text
	    // before ``start'' and computing its height.
	    if (_static.NEWLINES == null) {
		_static.NEWLINES = '\n'; // 64 of them should be enough.
		for (var i = 0; i < 6; i++) {
		    _static.NEWLINES += _static.NEWLINES;
		}
	    }
	    if (_static.helperTextarea == null) {
		_static.helperTextarea = document.createElement('TEXTAREA');
		_static.helperTextarea.style.display = 'none';
		document.body.appendChild(_static.helperTextarea);
	    }
	    var hta = _static.helperTextarea;
	    hta.style.display = '';
	    hta.style.width = ta.clientWidth + 'px';
	    hta.style.height = ta.clientHeight + 'px';
	    hta.value = _static.NEWLINES.substring(0, ta.rows) + ta.value.substring(0, start);
	    var yOffset = hta.scrollHeight;
	    hta.style.display = 'none';
	    ta.focus();
	    ta.setSelectionRange(start, end);
	    if (yOffset > ta.clientHeight) {
		yOffset -= Math.floor(ta.clientHeight / 2);
		ta.scrollTop = yOffset;
		// Opera does not support setting the scrollTop property
		if (ta.scrollTop != yOffset) {
		    // todo: Warn the user or apply a workaround
		}
	    } else {
		ta.scrollTop = 0;
	    }
	} else {
	    // IE incorrectly counts '\r\n' as a signle character
	    start -= ta.value.substring(0, start).split('\r').length - 1;
	    end -= ta.value.substring(0, end).split('\r').length - 1;
	    var range = ta.createTextRange();
	    range.collapse(true);
	    range.moveStart('character', start);
	    range.moveEnd('character', end - start);
	    range.select();
	}
    };

    // getPosition(e), observe(e, x, f), stopObserving(e, x, f),
    // and stopEvent(event) are inspired by the prototype.js framework
    // http://prototypejs.org/
    ARA_Functions.getPosition = function (e) {
	var x = 0;
	var y = 0;
	do {
	    x += e.offsetLeft || 0;
	    y += e.offsetTop  || 0;
	    e = e.offsetParent;
	} while (e);
	return {x: x, y: y};
    };

    ARA_Functions.observe = function (e, eventName, f) {
	if (e.addEventListener) {
	    e.addEventListener(eventName, f, false);
	} else {
	    e.attachEvent('on' + eventName, f);
	}
    };

    ARA_Functions.stopObserving = function (e, eventName, f) {
	if (e.removeEventListener) {
	    e.removeEventListener(eventName, f, false);
	} else {
	    e.detachEvent('on' + eventName, f);
	}
    };

    ARA_Functions.stopEvent = function (event) {
	if (event.preventDefault) {
	    event.preventDefault();
	    event.stopPropagation();
	} else {
	    event.returnValue = false;
	    event.cancelBubble = true;
	}
    };

    // ARA_Functions.anchor() is a shortcut to creating a link as a DOM node:
    ARA_Functions.anchor = function (text, href, title) {
	var e = document.createElement('A');
	e.href = href;
	e.appendChild(document.createTextNode(text));
	e.title = title || '';
	return e;
    };

    // ARA_Functions.link() produces the HTML for a link to a Wikipedia article as a string.
    // It is convenient to embed in a help popup.
    ARA_Functions.hlink = function (toWhat, text) {
	var wgServer = window.wgServer || 'http://en.wikipedia.org';
	var wgArticlePath = window.wgArticlePath || '/wiki/$1';
	var url = (wgServer + wgArticlePath).replace('$1', toWhat);
	return '<a href="' + url + '" target="_blank">' + (text || toWhat) + '</a>';
    };

    // === Helpers a la functional programming ===
    // A higher-order function---produces a cached version of a one-arg function.
    ARA_Functions.makeCached = function (f) {
	var cache = {}; // a closure; the cache is private for f
	return function (x) {
	    return (cache[x] != null) ? cache[x] : (cache[x] = f(x));
	};
    };

    // === Editor compatibility layer ===
    // Controlling access to wpTextbox1 helps abstract out compatibility
    // with editors like wikEd (http://en.wikipedia.org/wiki/User:Cacycle/wikEd)

    ARA_Functions.getWikiText = function () {
	if (window.wikEdUseWikEd) {
	    var obj = {sel: WikEdGetSelection()};
	    WikEdParseDOM(obj, wikEdFrameBody);
	    return obj.plain;
	}
	return JJJ.Constants.ARTICLE_TEXT_BOX_ELEMENT.val();
    };

    ARA_Functions.setWikiText = function (s) {
	if (window.wikEdUseWikEd) {
	    // todo: wikEd compatibility
	    alert(JJJ.Functions._('Changing text in wikEd is not yet supported.'));
	    return;
	};
	JJJ.Constants.ARTICLE_TEXT_BOX_ELEMENT.val(s);
    };

    ARA_Functions.focusWikiText = function () {
	if (window.wikEdUseWikEd) {
	    wikEdFrameWindow.focus();
	    return;
	}
	JJJ.Constants.ARTICLE_TEXT_BOX_ELEMENT.focus();
    };

    ARA_Functions.selectWikiText = function (start, end) {
	if (window.wikEdUseWikEd) {
	    var obj = x = {sel: WikEdGetSelection(), changed: {}};
	    WikEdParseDOM(obj, wikEdFrameBody);
	    var i = 0;
	    while ((obj.plainStart[i + 1] != null) && (obj.plainStart[i + 1] <= start)) {
		i++;
	    }
	    var j = i;
	    while ((obj.plainStart[j + 1] != null) && (obj.plainStart[j + 1] <= end)) {
		j++;
	    }
	    obj.changed.range = document.createRange();
	    obj.changed.range.setStart(obj.plainNode[i], start - obj.plainStart[i]);
	    obj.changed.range.setEnd(obj.plainNode[j], end - obj.plainStart[j]);
	    WikEdRemoveAllRanges(obj.sel);
	    obj.sel.addRange(obj.changed.range);
	    return;
	}
	ARA_Functions.setSelectionRange(document.getElementById(JJJ.Constants.ARTICLE_TEXT_BOX_ELEMENT.prop('id')), start, end);
    };

    ARA_Functions.observeWikiText = function (callback) {
	// todo: wikEd compatibility
	ARA_Functions.observe(document.getElementById(JJJ.Constants.ARTICLE_TEXT_BOX_ELEMENT.prop('id')), 'keyup', JJJ.Functions.delayScan);
    };

    // === Interaction with the user ===
    // ARA_Functions.scan() analyses the text and handles how the proposals are reflected in the UI.
    ARA_Functions.scan = function (force)
    {
	JJJ.Constants.scanTimeoutId = null;

	//get article text
	var s = JJJ.Functions.getWikiText();

	//determine if we actually need to scan
	if ((s === JJJ.Constants.scannedText) && !force)
	    return; // Nothing to do, we've already scanned the very same text

	JJJ.Constants.scannedText = s;

	//remove all current suggestions
	JJJ.Constants.SUGGESTION_BOX_DIV.empty();

	// Warn about scanning a big article
	if ((s.length > JJJ.Constants.BIG_THRESHOLD) && !JJJ.Constants.isBigScanConfirmed) {
	    JJJ.Constants.SUGGESTION_BOX_DIV.append(document.createTextNode(
		JJJ.Functions._('This article is rather long.  ARA may consume a lot of '
				+ 'RAM and CPU resources while trying to parse the text.  You could limit '
				+ 'your edit to a single section, or ')
	    ));
	    JJJ.Constants.SUGGESTION_BOX_DIV.append(JJJ.Functions.anchor(
		JJJ.Functions._('scan the text anyway.'),
		'javascript: JJJ.Constants.isBigScanConfirmed = true; JJJ.Functions.scan(true); void(0);',
		JJJ.Functions._('Ignore this warning.')
	    ));
	    return;
	}
	// Warn about scanning a talk page
	if ((   mw.config.get('wgCanonicalNamespace') === 'Talk'
		|| mw.config.get('wgCanonicalNamespace') === 'User_talk'
		|| mw.config.get('wgCanonicalNamespace') === 'Project_talk'
		|| mw.config.get('wgCanonicalNamespace') === 'MediaWiki_talk'
	    )
	    && !JJJ.Constants.isTalkPageScanConfirmed
	   )
	{
	    JJJ.Constants.SUGGESTION_BOX_DIV.append(document.createTextNode(
		JJJ.Functions._('ARA is disabled on talk pages, because ' +
				'it might suggest changing other users\' comments.  That would be ' +
				'something against talk page conventions.  If you promise to be ' +
				'careful, you can ')
	    ));
	    JJJ.Constants.SUGGESTION_BOX_DIV.append(JJJ.Functions.anchor(
		JJJ.Functions._('scan the text anyway.'),
		'javascript: JJJ.Constants.isTalkPageScanConfirmed = true; JJJ.Functions.scan(true); void(0);',
		JJJ.Functions._('Ignore this warning.')
	    ));
	    return;
	}

	//get suggestions
	JJJ.Constants.suggestions = JJJ.Functions.getSuggestions(s);

	//if there aren't any suggestions, say so
	if (JJJ.Constants.suggestions.length === 0)
	{
	    JJJ.Constants.SUGGESTION_BOX_DIV.append(document.createTextNode(
		JJJ.Functions._('OK \u2014 ARA found no referencing issues.') // U+2014 is an mdash
	    ));
	    return;
	}
	var nSuggestions = Math.min(JJJ.Constants.maxSuggestions, JJJ.Constants.suggestions.length);
	JJJ.Constants.SUGGESTION_BOX_DIV.append(document.createTextNode(
	    (JJJ.Constants.suggestions.length == 1)
		? JJJ.Functions._('1 suggestion: ')
		: JJJ.Functions._('$1 suggestions: ', JJJ.Constants.suggestions.length)
	));
	for (var i = 0; i < nSuggestions; i++) {
	    var suggestion = JJJ.Constants.suggestions[i];
	    var eA = JJJ.Functions.anchor(
		suggestion.name,
		'javascript:JJJ.Functions.showSuggestion(' + i + '); void(0);',
		suggestion.description
	    );
	    suggestion.element = eA;
	    JJJ.Constants.SUGGESTION_BOX_DIV.append(eA);
	    if (suggestion.replacement != null)
	    {
		var eSup = document.createElement('SUP');
		JJJ.Constants.SUGGESTION_BOX_DIV.append(eSup);
		var sup1 = suggestion.sup1 != null ? suggestion.sup1 : 'fix';

		eSup.appendChild (
		    JJJ.Functions.anchor (
			JJJ.Functions._(sup1),
			'javascript:JJJ.Functions.fixSuggestion(' + i + '); void(0);'
		    )
		);

		//sometimes, suggestions may have more than one fix link
		if (suggestion.replacement2 != null)
		{
		    var sup2 = suggestion.sup2 != null ? suggestion.sup2 : 'fix2';

		    eSup.appendChild(document.createTextNode(' | '));
		    eSup.appendChild(
			JJJ.Functions.anchor(
			    JJJ.Functions._(sup2),
			    'javascript:JJJ.Functions.fixSuggestion2(' + i + '); void(0);'
			)
		    );
		}
		if (suggestion.replacement3 != null)
		{
		    var sup3 = suggestion.sup3 != null ? suggestion.sup3 : 'fix3';

		    eSup.appendChild(document.createTextNode(' | '));
		    eSup.appendChild(
			JJJ.Functions.anchor(
			    JJJ.Functions._(sup3),
			    'javascript:JJJ.Functions.fixSuggestion3(' + i + '); void(0);'
			)
		    );
		}
	    }
	    JJJ.Constants.SUGGESTION_BOX_DIV.append(document.createTextNode(' '));
	}
	if (JJJ.Constants.suggestions.length > JJJ.Constants.maxSuggestions) {
	    JJJ.Constants.SUGGESTION_BOX_DIV.append(JJJ.Functions.anchor(
		'...', 'javascript: JJJ.Constants.maxSuggestions = 1000; JJJ.Functions.scan(true); void(0);',
		JJJ.Functions._('Show All')
	    ));
	}
    };

    // getSuggestions() returns the raw data used by scan().
    // It is convenient for unit testing.
    ARA_Functions.getSuggestions = function (s) {
	var suggestions = [];
	var missingRefGroupSuggestions = []; //we want to keep track of the ones we already have so we don't push the same message twice
	for (var i = 0; i < JJJ.Rules.length; i++)  //for each rule
	{
	    var a = JJJ.Rules[i](s); //execute rule
	    for (var j = 0; j < a.length; j++) //for each suggestion pushed by the rule
	    {
		var returned_suggestion = a[j];

		//if the suggestion is not a missing reference groups suggestion, or it is and we didn't already push this one
		if (!returned_suggestion.name.includes("missing reference groups") || !missingRefGroupSuggestions.includes(returned_suggestion.name))
		{
		    suggestions.push(returned_suggestion); //add suggestion to list of suggestions
		    missingRefGroupSuggestions.push(returned_suggestion.name); //add suggestion to list of suggestions we already have
		}
	    }
	}
	suggestions.sort(function (x, y) {
	    return (x.start < y.start) ? -1 :
		(x.start > y.start) ? 1 :
		(x.end < y.end) ? -1 :
		(x.end > y.end) ? 1 : 0;
	});
	return suggestions;
    };

    // === Internationalisation ===
    // ARA_Functions._() is a gettext-style internationalisation helper
    // (http://en.wikipedia.org/wiki/gettext)
    // If no translation is found for the parameter, it is returned as is.
    // Additionally, subsequent parameters are substituted for $1, $2, and so on.
    ARA_Functions._ = function (s) {
	if (JJJ.Constants.translation && JJJ.Constants.translation[s]) {
	    s = JJJ.Constants.translation[s];
	}
	var index = 1;
	while (arguments[index]) {
	    s = s.replace('$' + index, arguments[index]); // todo: replace all?
	    index++;
	}
	return s;
    };

    // showSuggestion() handles clicks on the suggestions above the edit area
    // This does one of two things:
    // * on first click---highlight the corresponding text in the textarea
    // * on a second click, no later than a fixed number milliseconds after the
    //		first one---show the help popup
    ARA_Functions.showSuggestion = function (k) {
	if (JJJ.Functions.getWikiText() != JJJ.Constants.scannedText) {
	    // The text has changed - just do another scan and don't change selection
	    JJJ.Functions.scan();
	    return;
	}
	var suggestion = JJJ.Constants.suggestions[k];
	var now = new Date().getTime();
	if ((suggestion.help != null) && (JJJ.Constants.lastShownSuggestionIndex === k) && (now - JJJ.Constants.lastShownSuggestionTime < 1000)) {
	    // Show help
	    var p = JJJ.Functions.getPosition(suggestion.element);
	    var POPUP_WIDTH = 300;
	    var eDiv = document.createElement('DIV');
	    eDiv.innerHTML = suggestion.help;
	    eDiv.style.position = 'absolute';
	    eDiv.style.left = Math.max(0, Math.min(p.x, document.body.clientWidth - POPUP_WIDTH)) + 'px';
	    eDiv.style.top = (p.y + suggestion.element.offsetHeight) + 'px';
	    eDiv.style.border = 'solid ThreeDShadow 1px';
	    eDiv.style.backgroundColor = 'InfoBackground';
	    eDiv.style.fontSize = '12px';
	    eDiv.style.color = 'InfoText';
	    eDiv.style.width = POPUP_WIDTH + 'px';
	    eDiv.style.padding = '0.3em';
	    eDiv.style.zIndex = 10;
	    document.body.appendChild(eDiv);
	    JJJ.Functions.observe(document.body, 'click', function (event) {
		event = event || window.event;
		var target = event.target || event.srcElement;
		var e = target;
		while (e != null) {
		    if (e == eDiv) {
			return;
		    }
		    e = e.parentNode;
		}
		document.body.removeChild(eDiv);
		JJJ.Functions.stopObserving(document.body, 'click', arguments.callee);
	    });
	    JJJ.Functions.focusWikiText();
	    return;
	}
	JJJ.Constants.lastShownSuggestionIndex = k;
	JJJ.Constants.lastShownSuggestionTime = now;
	JJJ.Functions.selectWikiText(suggestion.start, suggestion.end);
    };

    // Usually, there is a ``fix'' link next to each suggestion.  It is handled by:
    ARA_Functions.fixSuggestion = function(k)
    {
	var s = JJJ.Functions.getWikiText();
	if (s != JJJ.Constants.scannedText) {
	    JJJ.Functions.scan();
	    return;
	}
	var suggestion = JJJ.Constants.suggestions[k];
	// the issue is not automatically fixable, return
	if (suggestion.replacement == null) {
	    return;
	}
	JJJ.Functions.setWikiText(
	    s.substring(0, suggestion.start)
		+ suggestion.replacement
		+ s.substring(suggestion.end)
	);
	JJJ.Functions.selectWikiText(
	    suggestion.start,
	    suggestion.start + suggestion.replacement.length
	);
	// Propose an edit summary unless it's a new section
	var editform = document.getElementById('editform');
	if (!editform['wpSection'] || (editform['wpSection'].value != 'new')) {
	    if (JJJ.Constants.appliedSuggestions[suggestion.name] == null) {
		JJJ.Constants.appliedSuggestions[suggestion.name] = 1;
	    } else {
		JJJ.Constants.appliedSuggestions[suggestion.name]++;
	    }
	    var a = [];
	    for (var i in JJJ.Constants.appliedSuggestions) {
		a.push(i);
	    }
	    a.sort(function (x, y) {
		return (JJJ.Constants.appliedSuggestions[x] > JJJ.Constants.appliedSuggestions[y]) ? -1 :
		    (JJJ.Constants.appliedSuggestions[x] < JJJ.Constants.appliedSuggestions[y]) ? 1 :
		    (x < y) ? -1 : (x > y) ? 1 : 0;
	    });
	    var s = '';
	    for (var i = 0; i < a.length; i++) {
		var count = JJJ.Constants.appliedSuggestions[a[i]];
		s += ', ' + ((count == 1) ? a[i] : (count + 'x ' + a[i]));
	    }
	    // Cut off the leading ``, '' and add ``using ARA''
	    s = JJJ.Functions._(
		'fixed [[Template:Broken ref/cite error list|$1]] using [[User:TheJJJunk/ARA|ARA]]',
		s.substring(2)
	    );
	    if (s == "fixed [[Template:Broken ref/cite error list|missing Name in Persondata]] using [[User:TheJJJunk/ARA|ARA]]")
		s = "added [[Wikipedia:PERSON#Name and titles|missing Name in Persondata]] using [[User:TheJJJunk/ARA|ARA]]";
	    else if (s == "fixed [[Template:Broken ref/cite error list|empty Persondata template]] using [[User:TheJJJunk/ARA|ARA]]")
		s = "expanded [[Wikipedia:PERSON|empty Persondata template]] using [[User:TheJJJunk/ARA|ARA]]";
	    else if (s.indexOf("references in Portal page]] using [[User:TheJJJunk/ARA|ARA]]") > -1)
		s = "removed [[Wikipedia talk:Portal guidelines#References in portals|references from Portal page]] using [[User:TheJJJunk/ARA|ARA]]";
	    else if (s == "fixed [[Template:Broken ref/cite error list|{{Reflist}} in Portal page]] using [[User:TheJJJunk/ARA|ARA]]")
		s = "removed [[Wikipedia talk:Portal guidelines#References in portals|{{Reflist}} from Portal page]] using [[User:TheJJJunk/ARA|ARA]]";

	    // Render in DOM
	    JJJ.Constants.ADD_TO_SUMMARY_DIV.empty();
	    JJJ.Constants.ADD_TO_SUMMARY_DIV.show();
	    JJJ.Constants.ADD_TO_SUMMARY_DIV.append(JJJ.Functions.anchor(
		JJJ.Functions._('Add to summary'),
		'javascript:JJJ.Functions.addToSummary(unescape("' + escape(s) + '"));',
		JJJ.Functions._('Append the proposed summary to the input field below')
	    ));
	    JJJ.Constants.ADD_TO_SUMMARY_DIV.append(document.createTextNode(': "' + s + '"'));
	}
	// Re-scan immediately
	JJJ.Functions.scan();
    };

    // if a suggestion has two 'fix' options, the second option will be handled here
    ARA_Functions.fixSuggestion2 = function (k)
    {
	var s = JJJ.Functions.getWikiText();
	if (s != JJJ.Constants.scannedText) {
	    JJJ.Functions.scan();
	    return;
	}
	var suggestion = JJJ.Constants.suggestions[k];

	// the issue is not automatically fixable, return
	if (suggestion.replacement2 == null) {
	    return;
	}
	//otherwise, if we are executing JS, do so
	else if (suggestion.replacement2.includes("javascript:"))
	{
	    eval(suggestion.replacement2);
	    return;
	}
	JJJ.Functions.setWikiText(
	    s.substring(0, suggestion.start2)
		+ suggestion.replacement2
		+ s.substring(suggestion.end2)
	);
	JJJ.Functions.selectWikiText(
	    suggestion.start2,
	    suggestion.start2 + suggestion.replacement2.length
	);
	// Propose an edit summary unless it's a new section
	var editform = document.getElementById('editform');
	if (!editform['wpSection'] || (editform['wpSection'].value != 'new')) {
	    if (JJJ.Constants.appliedSuggestions[suggestion.name] == null) {
		JJJ.Constants.appliedSuggestions[suggestion.name] = 1;
	    } else {
		JJJ.Constants.appliedSuggestions[suggestion.name]++;
	    }
	    var a = [];
	    for (var i in JJJ.Constants.appliedSuggestions) {
		a.push(i);
	    }
	    a.sort(function (x, y) {
		return (JJJ.Constants.appliedSuggestions[x] > JJJ.Constants.appliedSuggestions[y]) ? -1 :
		    (JJJ.Constants.appliedSuggestions[x] < JJJ.Constants.appliedSuggestions[y]) ? 1 :
		    (x < y) ? -1 : (x > y) ? 1 : 0;
	    });
	    var s = '';
	    for (var i = 0; i < a.length; i++) {
		var count = JJJ.Constants.appliedSuggestions[a[i]];
		s += ', ' + ((count == 1) ? a[i] : (count + 'x ' + a[i]));
	    }
	    // Cut off the leading ``, '' and add ``using ARA''
	    s = JJJ.Functions._(
		'fixed [[Template:Broken ref/cite error list|$1]] using [[User:TheJJJunk/ARA|ARA]]',
		s.substring(2)
	    );
	    if (s == "fixed [[Template:Broken ref/cite error list|missing Name in Persondata]] using [[User:TheJJJunk/ARA|ARA]]")
		s = "added [[Wikipedia:PERSON#Name and titles|missing Name in Persondata]] using [[User:TheJJJunk/ARA|ARA]]";
	    else if (s == "fixed [[Template:Broken ref/cite error list|empty Persondata template]] using [[User:TheJJJunk/ARA|ARA]]")
		s = "expanded [[Wikipedia:PERSON|empty Persondata template]] using [[User:TheJJJunk/ARA|ARA]]";
	    else if (s.indexOf("references in Portal page]] using [[User:TheJJJunk/ARA|ARA]]") > -1)
		s = "removed [[Wikipedia talk:Portal guidelines#References in portals|references from Portal page]] using [[User:TheJJJunk/ARA|ARA]]";
	    else if (s == "fixed [[Template:Broken ref/cite error list|{{Reflist}} in Portal page]] using [[User:TheJJJunk/ARA|ARA]]")
		s = "removed [[Wikipedia talk:Portal guidelines#References in portals|{{Reflist}} from Portal page]] using [[User:TheJJJunk/ARA|ARA]]";

	    // Render in DOM
	    JJJ.Constants.ADD_TO_SUMMARY_DIV.empty();
	    JJJ.Constants.ADD_TO_SUMMARY_DIV.show();
	    JJJ.Constants.ADD_TO_SUMMARY_DIV.append(JJJ.Functions.anchor(
		JJJ.Functions._('Add to summary'),
		'javascript:JJJ.Functions.addToSummary(unescape("' + escape(s) + '"));',
		JJJ.Functions._('Append the proposed summary to the input field below')
	    ));
	    JJJ.Constants.ADD_TO_SUMMARY_DIV.append(document.createTextNode(': "' + s + '"'));
	}
	// Re-scan immediately
	JJJ.Functions.scan();
    };
    ARA_Functions.fixSuggestion3 = function (k)
    {
	var s = JJJ.Functions.getWikiText();
	if (s != JJJ.Constants.scannedText) {
	    JJJ.Functions.scan();
	    return;
	}
	var suggestion = JJJ.Constants.suggestions[k];
	if (suggestion.replacement3 == null) { // the issue is not automatically fixable
	    return;
	}
	JJJ.Functions.setWikiText(
	    s.substring(0, suggestion.start3)
		+ suggestion.replacement3
		+ s.substring(suggestion.end3)
	);
	JJJ.Functions.selectWikiText(
	    suggestion.start3,
	    suggestion.start3 + suggestion.replacement3.length
	);
	// Propose an edit summary unless it's a new section
	var editform = document.getElementById('editform');
	if (!editform['wpSection'] || (editform['wpSection'].value != 'new')) {
	    if (JJJ.Constants.appliedSuggestions[suggestion.name] == null) {
		JJJ.Constants.appliedSuggestions[suggestion.name] = 1;
	    } else {
		JJJ.Constants.appliedSuggestions[suggestion.name]++;
	    }
	    var a = [];
	    for (var i in JJJ.Constants.appliedSuggestions) {
		a.push(i);
	    }
	    a.sort(function (x, y) {
		return (JJJ.Constants.appliedSuggestions[x] > JJJ.Constants.appliedSuggestions[y]) ? -1 :
		    (JJJ.Constants.appliedSuggestions[x] < JJJ.Constants.appliedSuggestions[y]) ? 1 :
		    (x < y) ? -1 : (x > y) ? 1 : 0;
	    });
	    var s = '';
	    for (var i = 0; i < a.length; i++) {
		var count = JJJ.Constants.appliedSuggestions[a[i]];
		s += ', ' + ((count == 1) ? a[i] : (count + 'x ' + a[i]));
	    }
	    // Cut off the leading ``, '' and add ``using ARA''
	    s = JJJ.Functions._(
		'fixed [[Template:Broken ref/cite error list|$1]] using [[User:TheJJJunk/ARA|ARA]]',
		s.substring(2)
	    );
	    if (s == "fixed [[Template:Broken ref/cite error list|missing Name in Persondata]] using [[User:TheJJJunk/ARA|ARA]]")
		s = "added [[Wikipedia:PERSON#Name and titles|missing Name in Persondata]] using [[User:TheJJJunk/ARA|ARA]]";
	    else if (s == "fixed [[Template:Broken ref/cite error list|empty Persondata template]] using [[User:TheJJJunk/ARA|ARA]]")
		s = "expanded [[Wikipedia:PERSON|empty Persondata template]] using [[User:TheJJJunk/ARA|ARA]]";
	    else if (s.indexOf("references in Portal page]] using [[User:TheJJJunk/ARA|ARA]]") > -1)
		s = "removed [[Wikipedia talk:Portal guidelines#References in portals|references from Portal page]] using [[User:TheJJJunk/ARA|ARA]]";
	    else if (s == "fixed [[Template:Broken ref/cite error list|{{Reflist}} in Portal page]] using [[User:TheJJJunk/ARA|ARA]]")
		s = "removed [[Wikipedia talk:Portal guidelines#References in portals|{{Reflist}} from Portal page]] using [[User:TheJJJunk/ARA|ARA]]";

	    // Render in DOM
	    JJJ.Constants.ADD_TO_SUMMARY_DIV.empty();
	    JJJ.Constants.ADD_TO_SUMMARY_DIV.show();
	    JJJ.Constants.ADD_TO_SUMMARY_DIV.append(JJJ.Functions.anchor(
		JJJ.Functions._('Add to summary'),
		'javascript:JJJ.Functions.addToSummary(unescape("' + escape(s) + '"));',
		JJJ.Functions._('Append the proposed summary to the input field below')
	    ));
	    JJJ.Constants.ADD_TO_SUMMARY_DIV.append(document.createTextNode(': "' + s + '"'));
	}
	// Re-scan immediately
	JJJ.Functions.scan();
    };

    // The mnemonics of the accepted suggestions are accumulated in JJJ.Constants.appliedSuggestions
    // and the user is presented with a sample edit summary.  If she accepts it,
    // addToSummary() gets called.
    ARA_Functions.addToSummary = function (summary) {
	var wpSummary = document.getElementById('wpSummary');
	if (wpSummary.value != '') {
	    summary = wpSummary.value + '; ' + summary;
	}
	if ((wpSummary.maxLength > 0) && (summary.length > wpSummary.maxLength)) {
	    alert(JJJ.Funtions._(
		'Error: If the proposed text is added to the summary, '
		    + 'its length will exceed the $1-character maximum by $2 characters.',
		/* $1 = */ wpSummary.maxLength,
		/* $2 = */ summary.length - wpSummary.maxLength
	    ));
	    return;
	}
	wpSummary.value = summary;
	JJJ.Constants.ADD_TO_SUMMARY_DIV.hide();
    };

    // delayScan() postpones the invocation of scan() with a certain timeout.
    // If delayScan() is invoked once again during that time, the original
    // timeout is cancelled, and another, clean timeout is started from zero.
    //
    // delayScan() will normally be invoked when a key is pressed---this
    // prevents frequent re-scans while the user is typing.
    ARA_Functions.delayScan = function () {
	if (JJJ.Constants.scanTimeoutId != null) {
	    clearTimeout(JJJ.Constants.scanTimeoutId);
	    JJJ.Constants.scanTimeoutId = null;
	}
	JJJ.Constants.scanTimeoutId = setTimeout(JJJ.Functions.scan, 500);
    };

    return ARA_Functions;
}

function getARARules()
{
    var ARA_Rules = [];

    // == Rules ==

    // properties:
    // * start---the 0-based inclusive index of the first character to be replaced
    // * end---analogous to start, but exclusive
    // * replacement---the proposed wikitext
    // * name---this is what appears at the top of the page
    // * description---used as a tooltip for the name of the suggestion


    if (!mw.config.get('wgContentLanguage') || mw.config.get('wgContentLanguage') === 'en') { // from this line on, a level of indent is spared

	// The rules are stored in an array and are grouped into categories.
	//*****************************************************************************************
	//*****************************************************************************************
	// === Functions ===

	//***missing {{Reflist}}***
	ARA_Rules.push(function (s) {
	    var Re = "{{Reflist";var re = "{{reflist";var ore = "<references />";var oree = "<references/>";
	    var b = [];
	    var sstart;
	    var eend;
	    var rreplacement;
	    var mySection;
	    var name = document.URL;
	    if (name.indexOf("section=") < 0)
	    {
		if (s.indexOf("<ref") > -1 && s.indexOf(re) < 0 && s.indexOf(Re) < 0 && s.indexOf(ore) < 0 && s.indexOf(oree) < 0 && s.indexOf("{{reflist))") < 0 && s.indexOf("{{relist}}") < 0 && s.indexOf("{{Reflist|refs=") < 0 && s.indexOf("{{reflist|refs=") < 0
		    && document.URL.indexOf("title=Portal:") < 0) //(don't add reflist to portals)
		{
		    if (s.indexOf("==References==") > -1 || s.indexOf("== References ==") > -1 || s.indexOf("==Sources==") > -1 || s.indexOf("== Sources ==") > -1)
		    {
			if (s.indexOf("==References==") > -1){mySection = "==References=="; sstart = s.indexOf(mySection); eend = sstart + 14;}
			else if (s.indexOf("== References ==") > -1){mySection = "== References ==";sstart=s.indexOf(mySection);eend = sstart + 16;}
			else if (s.indexOf("==Sources==") > -1){mySection = "==Sources==";sstart=s.indexOf(mySection);eend=sstart+11;}
			else {mySection = "== Sources ==";sstart=s.indexOf(mySection);eend=sstart+13;}

			rreplacement = "==References==\n{{Reflist}}";
		    }

		    else if (s.indexOf("==Further reading==") > -1)
		    {
			sstart       = s.indexOf("==Further reading==");
			eend         = sstart + 19;
			rreplacement = "==References==\n{{Reflist}}\n\n==Further reading==";
		    }

		    else if (s.indexOf("==External links==") > -1 || s.indexOf("== External links ==")> -1 || s.indexOf("==External links ==") >-1
			     ||  s.indexOf("== External links==") > -1|| s.indexOf("== External Links ==")> -1 || s.indexOf("==External Links==") > -1)
		    {
			if (s.indexOf("==External links==") > -1){mySection = "==External links=="; sstart = s.indexOf(mySection); eend = sstart+18;}
			else if(s.indexOf("== External links ==")>-1){mySection="== External links ==";sstart=s.indexOf(mySection);eend= sstart + 20;}
			else if(s.indexOf("== External links==")>-1){mySection="== External links==";sstart=s.indexOf(mySection);eend=sstart+19;}
			else if(s.indexOf("== External Links ==")>-1){mySection="== External Links ==";sstart=s.indexOf(mySection);eend= sstart + 20;}
			else if(s.indexOf("==External Links==")>-1){mySection="==External Links==";sstart=s.indexOf(mySection);eend=sstart+18;}
			else {mySection = "==External links =="; sstart = s.indexOf(mySection); eend = sstart+19;}

			rreplacement = "==References==\n{{Reflist}}\n\n==External links==";
		    }

		    else if (s.indexOf("==See also==") > -1 || s.indexOf("== See also ==") > -1)
		    {
			var seeAlso;
			if (s.indexOf("==See also==") > 0)
			    seeAlso = "==See also==";
			else
			    seeAlso = "== See also ==";

			var afterSeeAlso = s.split(seeAlso)[1];
			if (s.indexOf("==See also==\n{{") > 0)
			    afterSeeAlso = afterSeeAlso.slice(afterSeeAlso.indexOf("}}"));

			while ((afterSeeAlso.indexOf("[[") < afterSeeAlso.indexOf("{{") || afterSeeAlso.indexOf("{{") == -1) && (afterSeeAlso.indexOf("[[") < afterSeeAlso.indexOf("[[Category:") || afterSeeAlso.indexOf("[[Category:") == -1))
			{
			    afterSeeAlso = afterSeeAlso.slice(afterSeeAlso.indexOf("]]")+2);
			}
			sstart       = s.indexOf(afterSeeAlso);
			eend         = sstart;
			rreplacement = "\n\n==References==\n{{Reflist}}";
		    }

		    else if (s.indexOf("{{Authority control") > -1)
		    {
			sstart                  = s.indexOf("{{Authority control");
			var completeTemplate    = s.split("{{Authority control")[1];
			completeTemplate    = completeTemplate.slice(completeTemplate.indexOf("}}" + 2));
			var completeTemplateLoc = completeTemplate.indexOf("}}");
			eend                    = sstart + completeTemplateLoc;
			rreplacement            = "==References==\n{{Reflist}}" + completeTemplate;
		    }

		    else if (s.indexOf("{{DEFAULTSORT") > -1)
		    {
			if (s.indexOf("}}\n\n{{DEFAULTSORT") > -1 || s.indexOf("}}\n{{DEFAULTSORT") > -1)
			{
			    if (s.indexOf("}}\n\n{{DEFAULTSORT") > -1) mySection = "}}\n\n{{DEFAULTSORT";
			    else mySection = "}}\n{{DEFAULTSORT";

			    var completeTemplate = mySection;
			    while (s.charAt(s.indexOf(completeTemplate)-1) != '{')
				completeTemplate = s.charAt(s.indexOf(completeTemplate)-1) + completeTemplate;

			    completeTemplate = "{{" + completeTemplate;
			    completeTemplate = completeTemplate.split("}}")[0];
			    completeTemplate = completeTemplate + "}}";

			    while (s.indexOf("}}\n" + completeTemplate) > -1 || s.indexOf("}}\n\n" + completeTemplate) > -1)
			    {
				var secondTemplate = s.split("\n"+completeTemplate)[0];
				secondTemplate = secondTemplate.slice(secondTemplate.lastIndexOf("{{"));
				completeTemplate   = secondTemplate+"\n"+completeTemplate;
			    }

			    sstart           = s.indexOf(completeTemplate);
			    eend             = sstart + completeTemplate.length;
			    rreplacement     = "==References==\n{{Reflist}}\n\n" + completeTemplate;
			}

			else
			{
			    sstart = s.indexOf("{{DEFAULTSORT");
			    var completeTemplate    = s.split("{{DEFAULTSORT")[1];
			    completeTemplate    = completeTemplate.slice(completeTemplate.indexOf("}}" + 2));
			    var completeTemplateLoc = completeTemplate.indexOf("}}");
			    eend                    = sstart + completeTemplateLoc;
			    rreplacement            = "==References==\n{{Reflist}}" + completeTemplate;
			}
		    }

		    else if (s.indexOf("[[Category:") > -1)
		    {
			if (s.indexOf("}}\n\n[[Category:") > -1 || s.indexOf("}}\n[[Category:") > -1)
			{
			    if (s.indexOf("}}\n\n[[Category:") > -1) mySection = "}}\n\n[[Category:";
			    else mySection = "}}\n[[Category:";

			    var completeTemplate = mySection;
			    while (s.charAt(s.indexOf(completeTemplate)-1) != '{')
				completeTemplate = s.charAt(s.indexOf(completeTemplate)-1) + completeTemplate;

			    completeTemplate = "{{" + completeTemplate;
			    completeTemplate = completeTemplate.split("}}")[0];
			    completeTemplate = completeTemplate + "}}";

			    while (s.indexOf("}}\n" + completeTemplate) > -1 || s.indexOf("}}\n\n" + completeTemplate) > -1)
			    {
				var secondTemplate = s.split("\n"+completeTemplate)[0];
				secondTemplate = secondTemplate.slice(secondTemplate.lastIndexOf("{{"));
				completeTemplate   = secondTemplate+"\n"+completeTemplate;
			    }

			    sstart           = s.indexOf(completeTemplate);
			    eend             = sstart + completeTemplate.length;
			    rreplacement     = "==References==\n{{Reflist}}\n\n" + completeTemplate;
			}

			else
			{
			    sstart = s.indexOf("[[Category:");
			    var completeTemplate    = s.slice(s.indexOf("[[Category:"));
			    completeTemplate    = completeTemplate.slice(completeTemplate.indexOf("}}" + 2));
			    var completeTemplateLoc = completeTemplate.indexOf("}}");
			    eend                    = sstart + completeTemplateLoc;
			    rreplacement            = "==References==\n{{Reflist}}" + completeTemplate;
			}
		    }

		    else if (s.indexOf("{{uncat") > -1)
		    {
			sstart       = s.indexOf("{{uncat") - 1;
			eend         = s.indexOf("{{uncat") - 1;
			rreplacement = "\n==References==\n{{Reflist}}\n";
		    }

		    else if (s.indexOf("stub}}") > -1)
		    {
			var stub = "stub}}";

			while (s.charAt(s.indexOf(stub)-1) != '{')
			    stub = s.charAt(s.indexOf(stub)-1) + stub;
			stub = "{{" + stub;

			sstart       = s.indexOf(stub) -1;
			eend         = s.indexOf(stub) -1;
			rreplacement = "\n==References==\n{{Reflist}}\n";
		    }

		    else
		    {
			sstart = s.length;
			eend   = s.length;
			rreplacement = "\n==References==\n{{Reflist}}\n";
		    }
		    b.push({
			start: sstart,
			end: eend,
			replacement: rreplacement,
			name: 'missing {{Reflist}}',
			description: '<ref></ref> tags are present, but the reference list template is missing.'
		    });
		}
	    }
	    return b;
	});

	//***inapplicable tag***
	ARA_Rules.push(function (s) {
	    var b = [];
	    var sstart;
	    var eend;
	    var rreplacement;

	    //if there is an "Unreferenced" tag and there are references present
	    if (  (s.indexOf("{{no footnotes|date") > -1
		   || s.indexOf("{{unreferenced|date") > -1
		   || s.indexOf("{{Unreferenced|date") > -1
		   || s.indexOf("{{unsourced|date")    > -1)
		  &&
		  (s.indexOf("{{Reflist") > -1
		   || s.indexOf("{{reflist") > -1)
		  &&
		  s.indexOf("<ref") > -1
	       )
	    {
		var unreferencedTemplate;
		if      (s.indexOf("{{no footnotes|date") > -1) unreferencedTemplate = "{{no footnotes|date";
		else if (s.indexOf("{{unreferenced|date") > -1) unreferencedTemplate = "{{unreferenced|date";
		else if (s.indexOf("{{Unreferenced|date") > -1) unreferencedTemplate = "{{Unreferenced|date";
		else                                            unreferencedTemplate = "{{unsourced|date";

		//build the rest of the tag until we hit the end of the template or the end of the article text
		while (!unreferencedTemplate.endsWith('}}') && unreferencedTemplate.length + 1 < s.length)
		    unreferencedTemplate += s.charAt(s.indexOf(unreferencedTemplate) + unreferencedTemplate.length);

		//if the template is on its own line, remove the entire line
		if (s.charAt(s.indexOf(unreferencedTemplate) - 1) === "\n"
		    && s.charAt(s.indexOf(unreferencedTemplate) + unreferencedTemplate.length) === '\n')
		{
		    unreferencedTemplate = "\n" + unreferencedTemplate + "\n";
		}

		sstart = s.indexOf(unreferencedTemplate);
		eend   = sstart + unreferencedTemplate.length;

		b.push({
		    start:       sstart,
		    end:         eend,
		    replacement: '',
		    name:        'inapplicable tag',
		    description: 'There is an unreferenced tag on the page, but <ref> tags are present. It may no longer apply.'
		});
	    }
	    return b;
	});

	//***unnecessary reference groups AND missing reference groups***//
	//We can use the same function to find both the unnecessary ref groups and the missing ones. Once we've found them, we can decide which
	// category they fall under
	ARA_Rules.push(function (s)
		       {
			   var b = [];
			   var noteGroups = ["n", "N", "note", "Note", "nb", "lower-alpha", "upper-alpha"];

			   //get indices of all 'group='s
			   var startIndex     = 0;
			   var searchStr      = "group=";
			   var searchStrLen   = searchStr.length;
			   var index          = null;
			   var indices        = [];

			   while ((index = s.indexOf(searchStr, startIndex)) > -1)
			   {
			       indices.push(index);
			       startIndex = index + searchStrLen;
			   }

			   var indicesLength = indices.length;
			   for (i = 0; i < indicesLength; i++) //for each group=
			   {
			       var groupIndex         = indices[i]; //index of "group="
			       var mySectionPrevIndex = groupIndex - 1;
			       var groupNameIndex     = groupIndex + 6; //after "group=";
			       var mySection          = s.substring(groupNameIndex);
			       var groupAndName       = s.substring(groupIndex); //contains "group=<name>..."
			       if (groupAndName.includes(">")) //if the ref isn't malformed
				   groupAndName = groupAndName.substring(0, groupAndName.indexOf(">")) + ">"; //cut away anything after end of ref, and re-add gt
			       //else, the ref is malformed
			       var fullRef            = groupAndName;
			       var cutOffQuote        = false;
			       if (mySection[0] == '"') //if quote following group declaration
			       {
				   mySection   = mySection.substring(1); //cut that character out
				   cutOffQuote = true;
			       }

			       //find the end of the group name
			       // : group=sampleName>   ...
			       // : group=sampleName /> ...
			       // : group="sampleName"  ...
			       // : group=sampleName name="winner" ...
			       // : Note: group=sample}}
			       // : Note: group=sample|name=sampleName...
			       var firstBracketAfterIndex = mySection.includes(">")                 ? mySection.indexOf(">")      : s.length;
			       var firstSlashAfterIndex   = mySection.includes("/")                 ? mySection.indexOf("/")      : s.length;
			       var firstQuoteAfterIndex   = mySection.includes("\"")                ? mySection.indexOf("\"")     : s.length;
			       var nameEqualsAfterIndex   = mySection.includes(" name=")            ? mySection.indexOf(" name=") : s.length;
			       var spaceAfterIndex        = mySection.includes(" ") && !cutOffQuote ? mySection.indexOf(" ")      : s.length;
			       var bracketAfterIndex      = mySection.includes("}")                 ? mySection.indexOf("}")      : s.length;
			       var vBarAfterIndex         = mySection.includes("|")                 ? mySection.indexOf("|")      : s.length;
			       var cutOffIndex            = firstBracketAfterIndex;
			       if (firstSlashAfterIndex < cutOffIndex) cutOffIndex = firstSlashAfterIndex;
			       if (firstQuoteAfterIndex < cutOffIndex) cutOffIndex = firstQuoteAfterIndex;
			       if (nameEqualsAfterIndex < cutOffIndex) cutOffIndex = nameEqualsAfterIndex;
			       if (spaceAfterIndex      < cutOffIndex) cutOffIndex = spaceAfterIndex;
			       if (bracketAfterIndex    < cutOffIndex) cutOffIndex = bracketAfterIndex;
			       if (vBarAfterIndex       < cutOffIndex) cutOffIndex = vBarAfterIndex;

			       var groupName = mySection.substring(0, cutOffIndex); //the name of the reference group

			       //if we already have a Reflist tag with this group name, skip this ref
			       var refLists = [
				   "{{Reflist|group="  + groupName + "}}",
				   "{{Reflist|group="  + groupName + "|",
				   "{{reflist|group="  + groupName + "}}",
				   "{{reflist|group="  + groupName + "|",
				   '{{Reflist|group="' + groupName + '"',
				   '{{reflist|group="' + groupName + '"',
			       ];

			       var listAlreadyPresent = false;
			       for (j = 0; j < refLists.length; j++)
			       {
				   if (s.includes(refLists[j]))
				   {
				       listAlreadyPresent = true;
				       break;
				   }
			       }

			       if (listAlreadyPresent)
				   continue;

			       //otherwise, if this is a group that we WANT to add a reflist for
			       if (noteGroups.includes(groupName))
			       {
				   var startIndex       = null;
				   var endIndex         = null;
				   var replacementText  = null;
				   var suggestionName   = 'missing reference groups (' + groupName + ')';
				   var includesNotesHdr = false;

				   //determine where to place the new list. We'll either be adding it to an existing Notes section or creating a new Notes section.
				   // In certain cases, the Notes section may contain a ;Footnotes sub-heading, in which case we'll want to put the new list beneath that
				   // sub-heading.
				   // If we're creating a new Notes section, we'll want to put the new section above the References section

				   var notesHeaderVariations = ["==Notes==", "== Notes == "];

				   for (j = 0; j < notesHeaderVariations.length; j++)
				   {
				       var notesHeader = notesHeaderVariations[j];

				       if (s.includes(notesHeader))
				       {
					   var notesHeaderWithFootnotesSubHeading = notesHeader + "\n;Footnotes\n";

					   //determine if the section contains the ;Footnotes sub-heading
					   if (s.includes(notesHeaderWithFootnotesSubHeading))
					       startIndex = s.indexOf(notesHeaderWithFootnotesSubHeading) + notesHeaderWithFootnotesSubHeading.length;

					   else //no Footnotes sub-heading
					       startIndex = s.indexOf(notesHeader) + notesHeader.length;

					   endIndex        = startIndex;
					   replacementText = "{{Reflist|group=" + groupName + "}}\n";

					   includesNotesHdr = true;
					   break;
				       }
				   }

				   //otherwise, there is no Notes header, so we'll be creating one
				   if (!includesNotesHdr)
				   {
				       referencesHeader = "==References==";

				       if (!s.includes(referencesHeader))
					   referencesHeader = "== References ==";

				       startIndex      = s.indexOf(referencesHeader) - 1;
				       endIndex        = startIndex;
				       replacementText = "\n==Notes==\n{{Reflist|group=" + groupName + "}}\n";
				   }

				   b.push({
				       start:       startIndex,
				       end:         endIndex,
				       replacement: replacementText,
				       name:        suggestionName,
				       description: suggestionName
				   });
			       }

			       else //the ref group is "unnecessary"
			       {
				   //else, this is a group we want to replace.
				   //Check to see if the reference already has a name. If it doesn't, add one. If it does, just remove the group
				   //get to the beginning of the reference
				   while (mySectionPrevIndex >= 0 && s.charAt(mySectionPrevIndex) != '<')
				   {
				       fullRef = s.charAt(mySectionPrevIndex) + fullRef; //prepend the character
				       --mySectionPrevIndex; //decrement index
				   }
				   //now at the beginning of the reference (or the page, if the reference was malformed)
				   // and we already have to the end of the ref, so we have the full ref
				   fullRef = "<" + fullRef;

				   //re-build mySection with the group name intact, since we removed it before
				   var addBackNum = cutOffQuote ? 7 : 6;
				   mySection = s.substring(groupIndex, groupIndex + addBackNum + cutOffIndex);

				   //whether or not the ref contains "name=" already, we'll start at the same place
				   var startReplaceIndex = s.indexOf(fullRef) + fullRef.indexOf("group="); //start at the beginning of the "group="

				   //if there is already a name for this ref, we want to remove the entire "group=<name>".
				   //We need to also remove any quotes around the group name
				   if (fullRef.includes("name="))
				   {
				       var endReplaceIndex = startReplaceIndex + addBackNum + groupName.length; //end after the group name
				       if (cutOffQuote)			  //if we removed a quote earlier, then we know we need to also remove quotes
					   endReplaceIndex += 1; //add to include extra quote

				       //if there are spaces at both ends of the section we're removing, take away one of the spaces so we aren't left with two consecutive spaces
				       if (s.charAt(startReplaceIndex-1) == ' ' && s.charAt(endReplaceIndex) == ' ')
					   ++endReplaceIndex;

				       //if the ref group is at the end of an open ref, check to see if we should remove an extra space preceding the group
				       if (s.charAt(startReplaceIndex-1) == ' ' && s.charAt(endReplaceIndex) == '>')
					   --startReplaceIndex;

				       b.push({
					   start: startReplaceIndex,
					   end: endReplaceIndex,
					   replacement: "",
					   name: 'unnecessary reference groups (' + groupName + ')',
					   description: 'Reference groups in citations are causing an error.'
				       });
				   }

				   else //there isn't already a name, so just replace "group=" with "name="
				   {
				       var endReplaceIndex = startReplaceIndex + 5; //+ "group"

				       b.push({
					   start:       startReplaceIndex,
					   end:         endReplaceIndex,
					   replacement: "name",
					   name:        'unnecessary reference groups (' + groupName + ')',
					   description: 'Reference groups in citations are causing an error.'
				       });
				   }
			       }
			   }

			   return b;
		       });

	//***missing notelist***
	ARA_Rules.push(function(s)
		       {
			   var b               = [];
			   var theMatchWeFound = null;

			   //potential matches
			   var potentialMatchesWithReplacements = [
			       {
				   ref:  "{{efn-ua",
				   list: ["{{notelist-ua}}", "{{Notelist-ua}}"],
				   name: "missing notelist-ua"
			       },
			       {
				   ref:  "{{efn-lr",
				   list: ["{{notelist-lr}}", "{{Notelist-lr}}"],
				   name: "missing notelist-lr"
			       },
			       {
				   ref:  "{{efn|",
				   list: ["{{notelist}}", "{{Notelist}}"],
				   name: "missing notelist"
			       },
			       {
				   ref:  "group=lower-alpha",
				   list: ["{{notelist}}", "{{Notelist}}"],
				   name: "missing notelist"
			       }
			   ];

			   //look for matches
			   for (i = 0; i < potentialMatchesWithReplacements.length; i++)
			   {
			       //if we've already found a match, break
			       if (theMatchWeFound !== null)
				   break;

			       var thisMatch = potentialMatchesWithReplacements[i];

			       //determine if any of the lists are already present; if any are present, we do not have a match
			       var alreadyHasList = false;
			       for (j = 0; j < thisMatch.list.length; j++)
			       {
				   if (s.includes(thisMatch.list[j]))
				   {
				       alreadyHasList = true;
				       break;
				   }
			       }

			       if (alreadyHasList)
				   continue;

			       //look for the ref (remember that we've already checked above to determine if the article contains the list)
			       if (s.includes(thisMatch.ref))
			       {
				   theMatchWeFound = {
				       ref:  thisMatch.ref,
				       list: thisMatch.list[0],
				       name: thisMatch.name
				   };
			       }
			   }

			   //if we found a match, determine the change we need to make and where we need to make it
			   if (theMatchWeFound !== null)
			   {
			       var startIndex       = null;
			       var endIndex         = null;
			       var replacementText  = null;
			       var containsNotesHdr = false;

			       //if the article contains the ==Notes== header, we simply want to add the notelist to the Notes section
			       var notesHdrVariations = ["==Notes==", "== Notes =="];

			       for (i = 0; i < notesHdrVariations.length; i++)
			       {
				   var notesHdr = notesHdrVariations[i];

				   if (s.includes(notesHdr))
				   {
				       startIndex       = s.indexOf(notesHdr) + notesHdr.length;
				       endIndex         = startIndex;
				       replacementText  = "\n" + theMatchWeFound.list;
				       containsNotesHdr = true;
				       break;
				   }
			       }

			       //if the article does NOT contain the Notes header, then it is assumed that it contains the References header (one of the two variations)
			       if (!containsNotesHdr)
			       {
				   var refHdrSyntax = "==References==";

				   if (!s.includes(refHdrSyntax))
				       refHdrSyntax = "== References ==";

				   startIndex      = s.indexOf(refHdrSyntax);
				   endIndex        = s.indexOf(refHdrSyntax) + refHdrSyntax.length;
				   replacementText = "==Notes==\n" + theMatchWeFound.list + "\n\n" + refHdrSyntax;
			       }

			       //push result
			       b.push({
				   start:       startIndex,
				   end:         endIndex,
				   replacement: replacementText,
				   name:        theMatchWeFound.name,
				   description: theMatchWeFound.name
			       });
			   }

			   return b;
		       });

	//***invalid <ref></ref> tags***
	ARA_Rules.push(function (s) {
	    var b = [];
	    var sstart;
	    var eend;
	    var rreplacement;
	    var mySection;
	    var theList;
	    if (s.indexOf("{{Reflist|refs=") < 0 &&        // limiting factors
		s.indexOf("{{reflist|refs=") < 0 &&
		s.indexOf("<ref") > -1           &&
		(  s.indexOf("{{Reflist") > -1      ||
		   s.indexOf("{{reflist") > -1      ||
		   s.indexOf("<references/>") > -1  ||
		   s.indexOf("<references />") > -1
		)
	       )
	    {
		if (s.indexOf("{{Reflist") > -1) theList = "{{Reflist";
		else if (s.indexOf("{{reflist") > -1) theList = "{{reflist";        // defining type of reflist
		else if (s.indexOf("<references/>") >-1) theList = "<references/>";
		else theList = "<references />";

		if (s.lastIndexOf("<ref>") > s.indexOf(theList))    // if there is "<ref>" below reflist
		{
		    mySection    = s.split(theList)[1];   // mySection = everything after reflist
		    mySection    = mySection.slice(mySection.indexOf("<ref>")); // mySection starts at the <ref> tag

		    if (mySection.indexOf("</ref>") < 0) // if there is only the <ref> tag, not the </ref>
		    {
			mySection    = "<ref>";
			sstart       = s.lastIndexOf(mySection);
			eend         = sstart + 5;
			rreplacement = "*";
		    }

		    else
		    {
			var oneRef   = "";
			var counter  = 0;

			if (mySection.indexOf("</ref>") > mySection.indexOf(oneRef))
			{
			    while (oneRef.indexOf("</ref>") < 0)
			    {
				oneRef = oneRef + mySection.charAt(counter);
				++counter;
			    }
			}
			oneRef = oneRef + mySection.charAt(counter+1);
			oneRef = oneRef.split("<ref>")[1];
			oneRef = oneRef.split("</ref>")[0];

			sstart       = s.lastIndexOf(mySection);
			eend         = sstart + oneRef.length+11;
			rreplacement = "*" + oneRef;
		    }

		    b.push({
			start: sstart,
			end: eend,
			replacement: rreplacement,
			name: 'Invalid <ref></ref> tags',
			description: '<ref></ref> tags are located below the {{Reflist}} template, causing an error.'
		    });
		}
	    }
	    return b;
	});

	//***broken ref tags***
	ARA_Rules.push(function (s) {
	    var b = [];
	    var sstart;
	    var eend;
	    var rreplacement;
	    if (s.indexOf("./ref>") > -1 || s.indexOf("</ref\n") > -1 || s.indexOf(",/ref>") > -1 || s.indexOf("</ref?") > -1)
	    {
		if (s.indexOf("./ref>") > -1)
		{
		    sstart       = s.indexOf("./ref>");
		    eend         = sstart + 6;
		    rreplacement = "</ref>";
		}

		else if (s.indexOf("</ref\n") > -1)
		{
		    sstart       = s.indexOf("</ref\n");
		    eend         = sstart + 5;
		    rreplacement = "</ref>";
		}

		else if (s.indexOf("</ref?") > -1)
		{
		    sstart       = s.indexOf("</ref?");
		    eend         = sstart + 6;
		    rreplacement = "</ref>";
		}

		else
		{
		    sstart       = s.indexOf(",/ref");
		    eend         = sstart + 6;
		    rreplacement = "</ref>";
		}

		b.push({
		    start: sstart,
		    end: eend,
		    replacement: rreplacement,
		    name: 'broken <ref></ref> tags',
		    description: 'Broken <ref> or </ref> tags exist on the page.'
		});
	    }
	    return b;
	});

	//***broken reflist***
	ARA_Rules.push(function (s)
		       {
			   var b = [];

			   var matches = [
			       {
				   original:    "{{reflist))",
				   replacement: "{{Reflist}}"
			       },
			       {
				   original:    "{{relist}}",
				   replacement: "{{Reflist}}"
			       },
			       {
				   original:    "{{reflist group",
				   replacement: "{{Reflist|group"
			       },
			       {
				   original:    "{{Reflist|2}\n",
				   replacement: "{{Reflist|2}}\n"
			       },
			       {
				   original:    "{{Reflist||group=",
				   replacement: "{{Reflist|group="
			       }
			   ];

			   for (i = 0; i < matches.length; i++)
			   {
			       var match = matches[i];

			       if (s.includes(match.original))
			       {
				   var startIndex = s.indexOf(match.original);

				   b.push({
				       start:       startIndex,
				       end:         startIndex + match.original.length,
				       replacement: match.replacement,
				       name:        "broken {{Reflist}}",
				       description: "There is a broken Reflist template on the page"
				   });
			       }
			   }

			   return b;
		       });

	//***empty citations***
	ARA_Rules.push(function (s) {
	    var b = [];
	    var sstart;
	    var eend;
	    var rreplacement;
	    if (s.indexOf("<ref></ref>") > -1)
	    {
		var commentB = s.indexOf("<!--");
		var commentE = s.indexOf("-->");

		if (s.indexOf("<!--")       < 0                  || //to not break comments
		    s.indexOf("<ref></ref>") < s.indexOf("<!--") ||
		    s.indexOf("<ref></ref>") > s.indexOf("-->")
		   )
		    sstart       = s.indexOf("<ref></ref>");
		eend         = sstart + 11;
		rreplacement = "";

		b.push({
		    start: sstart,
		    end: eend,
		    replacement: rreplacement,
		    name: 'empty citations',
		    description: 'Empty citations exist on the page.'
		});
	    }
	    return b;
	});

	//***URL scheme error (Capital)***
	ARA_Rules.push(function (s) {
	    var b       = [];
	    var matches = ["A", "B", "C", "D", "E", "F", "G", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

	    for (i = 0; i < matches.length; i++)
	    {
		var match = "|url=" + matches[i];
		if (s.includes(match))
		{
		    b.push({
			start:       s.indexOf(match),
			end:         s.indexOf(match) + 5,
			replacement: "|url=http://",
			name:        'URL scheme error (Capital)',
			description: 'Invalid URL parameter',
			sup1:        'prepend "http://"'
		    });
		}
	    }

	    return b;
	});

	//***URL scheme error***
	ARA_Rules.push(function (s)
		       {
			   var b       = [];
			   var matches = ["a", "b", "c", "d", "e", "f", "g", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

			   for (i = 0; i < matches.length; i++)
			   {
			       var match = "|url=" + matches[i];
			       if (s.includes(match))
			       {
				   b.push({
				       start:       s.indexOf(match),
				       end:         s.indexOf(match) + 5,
				       replacement: "|url=http://",
				       name:        'URL scheme error',
				       description: 'Invalid URL parameter'
				   });
			       }
			   }

			   return b;
		       });

	//***space in URL parameter OR URL ends with period***
	ARA_Rules.push(function (s) {
	    var b = [];

	    //get indices of all '|url='s
	    var startIndex = 0;
	    var searchStr = "|url=";
	    var searchStrLen = searchStr.length;
	    var index, indices = [];
	    while ((index = s.indexOf(searchStr, startIndex)) > -1)
	    {
		indices.push(index);
		startIndex = index + searchStrLen;
	    }

	    var indicesLength = indices.length;
	    for (i = 0; i < indicesLength; i++) //for each |url=
	    {
		var urlStartIndex = indices[i] + searchStr.length;
		var indexOnward   = s.substring(urlStartIndex); //+searchStr.length to exclude "|url="

		//get to the actual beginning of the URL if there are spaces or newlines after the "url=" and before the start of the url
		while ((indexOnward[0] == ' ' || indexOnward[0] == '\n'))
		{
		    indexOnward = indexOnward.substring(1); //cut off the first character
		    ++urlStartIndex;
		}

		var fullRef          = indexOnward;
		var fullRefPrevIndex = urlStartIndex - 1;

		//indices of various characters in the citation
		var firstBracketAfterIndex = indexOnward.includes("}") ? indexOnward.indexOf("}") : s.length;
		var firstBarAfterIndex     = indexOnward.includes("|") ? indexOnward.indexOf("|") : s.length;

		//get to the end of the citation
		fullRef = fullRef.substring(0, firstBracketAfterIndex);

		//get to the beginning of the citation
		while (fullRefPrevIndex >= 0 && s.charAt(fullRefPrevIndex) != '{')
		{
		    fullRef = s.charAt(fullRefPrevIndex) + fullRef; //prepend the character
		    --fullRefPrevIndex; //decrement index
		}
		//now we have the full ref.

		//get the entire URL parameter. The parameter should either end with another | or }} for the end of the ref (if not malformed)
		//find the nearest delimeter
		var cutOffIndex = firstBarAfterIndex;

		if (firstBracketAfterIndex < cutOffIndex)
		    cutOffIndex = firstBracketAfterIndex;

		var url = indexOnward.substring(0, cutOffIndex).trim(); //the url parameter

		//if the url contains a space
		if (url.includes(" "))
		{
		    //we will provide different options for the user, depending on which parameters are already included in the citation.
		    //For example, if there is already a work or a website parameter, we don't want to suggest adding a 'work' parameter.
		    //We will always suggest to replace the spaces with '%20' and to remove the content after the space in the URL.
		    //If there are no 'work' or 'website' parameters, we will suggest a 'work' parameter.
		    //If there are already 'work' or 'website' parameters and there isn't a 'publisher' param, we will suggest a 'publisher' parameter.

		    //these don't change
		    var start1       = urlStartIndex;
		    var end1         = urlStartIndex + url.length;
		    var replacement1 = url.replace(new RegExp(" ", 'g'), "%20"); //replace all spaces in url with encoded spaces
		    var supp1         = 'replace spaces with "%20"'; //note extra 'p' is intentional

		    var startt3       =  urlStartIndex + url.indexOf(" ");
		    var endd3         =  urlStartIndex + url.indexOf(" ") + url.substring(url.indexOf(" ")).length;
		    var replacementt3 = "";
		    var supp3        = 'remove content following url'; //note extra 'p' is intentional

		    //if the citation doesn't already include 'work' or 'website' parameters
		    if (!fullRef.includes("|work=") && !fullRef.includes("|website="))
		    {
			b.push({
			    start:        start1,
			    end:          end1,
			    replacement:  replacement1,
			    name:         'URL parameter containing space(s)',
			    description:  'URLs cannot contain spaces',
			    sup1:         supp1,
			    start2:       urlStartIndex + url.indexOf(" "),
			    end2:         urlStartIndex + url.indexOf(" ") + 1, //+1 b/c we want to remove the space as well
			    replacement2: "javascript:window.open('https://www.google.com/search?q=" + url + "', '_blank');",
			    sup2:         "Search Google for the current URL value",
			    start3:       startt3,
			    end3:         endd3,
			    replacement3: replacementt3,
			    sup3:         supp3
			});
		    }
		    //otherwise, if the citation doesn't already include the 'publisher' parameter
		    else if (!fullRef.includes("|publisher="))
		    {
			b.push({
			    start:        start1,
			    end:          end1,
			    replacement:  replacement1,
			    name:         'URL parameter containing space(s)',
			    description:  'URLs cannot contain spaces',
			    sup1:         supp1,
			    start2:       urlStartIndex + url.indexOf(" "),
			    end2:         urlStartIndex + url.indexOf(" ") + 1, //+1 b/c we want to remove the space as well
			    replacement2: "|publisher=",
			    sup2:         'split into "url" and "publisher"', //used for naming the 'sup' element
			    start3:       startt3,
			    end3:         endd3,
			    replacement3: replacementt3,
			    sup3:         supp3
			});
		    }
		    //otherwise, the citation already contains a 'work' (or 'website') and 'publisher' params, so no 3rd option
		    else
		    {
			b.push({
			    start:        start1,
			    end:          end1,
			    replacement:  replacement1,
			    name:         'URL parameter containing space(s)',
			    description:  'URLs cannot contain spaces',
			    sup1:         supp1,
			    start2:       startt3,
			    end2:         endd3,
			    replacement2: replacementt3,
			    sup2:         supp3
			});
		    }
		}

		//alternatively, if the url ends with a period
		else if (url.endsWith('.'))
		{
		    b.push({
			start:        urlStartIndex + url.length - 1,
			end:          urlStartIndex + url.length,
			replacement:  '',
			name:         'URL parameter ending with a period',
			description:  'URLs cannot end with periods',
			sup1:         '[Remove trailing period]'
		    });
		}
	    }

	    return b;
	});

	//***invalid ref position***
	ARA_Rules.push(function (s) {
	    var b = [];
	    var sstart;
	    var eend;
	    var rreplacement;
	    var spacingType;
	    var mySection;

	    if (s.indexOf(" <ref") > -1 || s.indexOf("</ref>.") > -1 || s.indexOf("</ref>,") > -1)
	    {
		if (s.indexOf(" <ref") > -1)
		{
		    spacingType = " <ref"; sstart = s.indexOf(spacingType);eend = sstart + 5;rreplacement = "<ref";
		}

		else if (s.indexOf("</ref>.") > -1)
		{
		    var oneRef   = "</ref>.";               //oneRef = </ref>.
		    var counter  = s.indexOf(oneRef) - 1;

		    while (oneRef.indexOf("<ref") < 0)
		    {
			oneRef = s.charAt(counter) + oneRef;
			--counter;
		    }                                       //oneRef = <ref..>content</ref>.
		    oneRef = oneRef.slice(0,oneRef.length-1);    //oneRef = <ref..>content</ref>

		    sstart       = s.indexOf(oneRef);
		    eend         = sstart + oneRef.length + 1;
		    rreplacement = "." + oneRef;
		}

		else if (s.indexOf("</ref>,") > -1)
		{
		    var oneRef   = "</ref>,";               //oneRef = </ref>,
		    var counter  = s.indexOf(oneRef) - 1;

		    while (oneRef.indexOf("<ref") < 0)
		    {
			oneRef = s.charAt(counter) + oneRef;
			--counter;
		    }                                       //oneRef = <ref..>content</ref>,
		    oneRef = oneRef.slice(0,oneRef.length-1);    //oneRef = <ref..>content</ref>

		    sstart       = s.indexOf(oneRef);
		    eend         = sstart + oneRef.length + 1;
		    rreplacement = "," + oneRef;
		}


		b.push({
		    start: sstart,
		    end: eend,
		    replacement: rreplacement,
		    name: 'invalid ref position',
		    description: 'invalid ref position.'
		});
	    }
	    return b;
	});
	/*
	//***citation with accessdate and no URL***
	ARA_Rules.push(function (s) {
	var b = [];
	var sstart;
	var eend;
	var citation;
	var rreplacement;
	var restOfS;
	if (s.indexOf("{{cite") > -1)
	{
	citation = s.split("{{cite")[1];
	citation = citation.split("}}")[0];

	//move to next citation if the current one is fine
	if (citation.indexOf("accessdate") < 0 || citation.indexOf("url") > -1)
	{
	restOfS  = s.slice(s.indexOf(citation));
	restOfS  = restOfS.slice(restOfS.indexOf("}}"));

	citation = restOfS.split("{{cite")[1];
	citation = citation.split("}}")[0];
	}

	//current citation has the problem
	else if (citation.indexOf("url") < 0 && citation.indexOf("accessdate") > -1)
	{
	var accessdateSection = "accessdate";
	while (accessdateSection.indexOf("|") < 0 && accessdateSection.indexOf("{{") < 0 && accessdateSection.length < 30)
	{
	accessdateSection = citation.charAt(citation.indexOf(accessdateSection)-1) + accessdateSection;
	}
	// accessdateSection = "|" + accessdateSection;

	var theAccessdate = "accessdate";
	while (theAccessdate.indexOf("|") < 0 && theAccessdate.indexOf("}}") < 0 && theAccessdate.length < 30)
	{
	theAccessdate = theAccessdate + citation.charAt(theAccessdate.length + 1);
	}

	sstart = s.indexOf(citation) + citation.indexOf(theAccessdate); //beginning of section: "|accessdate="
	eend   = sstart + theAccessdate.length;
	//- 10 + theAccessdate.length; //end of accessdate section (beginning of section - overlap + section

	b.push({
	start: sstart,
	end: eend,
	replacement: '',
	name: 'CS1 error: accessdate without URL',
	description: 'accessdate is listed in citation but URL is not'
	});
	}
	}

	return b;
	});*/

	//***References in Portals, per WP talk:Portal guidelines#References in portals***
	ARA_Rules.push(function (s) {
	    var b = [];
	    var sstart;
	    var eend;
	    var rreplacement;
	    var name;
	    if (document.URL.indexOf("title=Portal:") > -1 && s.indexOf("<ref") > -1) //page is a portal page that contains references
	    {
		sstart = s.indexOf("<ref");
		eend   = s.indexOf("</ref>") + 6; //may possibly be overwritten below
		rreplacement = ""; //just take out the reference

		//if a reference has been previously named and the current reference is just a name, such as
		//<ref name="..." />, we'll need to handle this differently since the '/>' comes before another '</ref>'
		if (s.indexOf("<ref name") == s.indexOf("<ref")) //this is a named reference
		{
		    var entireRef = s.substring(s.indexOf("<ref")); //get the supposed reference
		    if (entireRef.indexOf("</ref>") > -1) //there is a closing ref tag on the page (possibly the closing tag to this ref)
		    {
			entireRef = entireRef.substring(0,entireRef.indexOf("</ref>")); //cut at the the </ref>
			if (entireRef.indexOf("/>") > -1) //assume by this that the reference is an empty named reference
			    eend = s.indexOf(entireRef) + entireRef.indexOf("/>") + 2; //stop at the "/>"
		    }
		    else //assume that the reference MUST be a named ref since there is no closing ref tag after this point
			eend = s.indexOf(entireRef) + entireRef.indexOf("/>") + 2; //stop at the "/>"


		}

		b.push({
		    start: sstart,
		    end: eend,
		    replacement: rreplacement,
		    name: 'references in Portal page',
		    description: 'According to Portal guidelines, Portal pages should not contain references.'
		});
	    }

	    return b;
	});

	//***Reflists in Portals, per WP talk:Portal guidelines#References in portals***
	ARA_Rules.push(function (s) {
	    var b = [];
	    var sstart;
	    var eend;
	    var rreplacement;
	    var name;
	    if (document.URL.indexOf("title=Portal:") > -1 && s.indexOf("{{Reflist}}") > -1) //page is a portal page that contains a Reflist
	    {
		sstart = s.indexOf("{{Reflist}}");
		eend   = sstart + 11;
		rreplacement = ""; //just take out the reflist

		b.push({
		    start: sstart,
		    end: eend,
		    replacement: rreplacement,
		    name: '{{Reflist}} in Portal page',
		    description: 'According to Portal guidelines, Portal pages should not contain {{Reflist}}s'
		});
	    }

	    return b;
	});

	//***Empty Persondata template***
	ARA_Rules.push(function (s) {
	    var b = [];
	    var sstart;
	    var eend;
	    var rreplacement;
	    var name;
	    if (s.indexOf("{{Persondata}}") > -1) //blank persondata template
	    {
		sstart       = s.indexOf("{{Persondata}}");
		eend         = sstart + 14;
		rreplacement = "{{Persondata\n| NAME              = \n| ALTERNATIVE NAMES = \n| SHORT DESCRIPTION = \n| DATE OF BIRTH     = \n| PLACE OF BIRTH    = \n| DATE OF DEATH     = \n| PLACE OF DEATH    = \n}}";

		b.push({
		    start: sstart,
		    end: eend,
		    replacement: rreplacement,
		    name: 'empty Persondata template',
		    description: 'The Persondata template missing required parameters.'
		});
	    }

	    return b;
	});

	//***missing Name in Persondata***
	ARA_Rules.push(function (s) {
	    var b = [];
	    var sstart;
	    var eend;
	    var rreplacement;
	    var name;
	    if (s.indexOf("{{Persondata\n| NAME") > -1) //non-empty persondata template present
	    {
		var afterName = s.substring(s.indexOf("{{Persondata\n| NAME"));
		afterName = afterName.substring(0, afterName.indexOf("}}")); //get just the persondata template
		var afterNameEq = afterName.indexOf("="); //first '=' in persondata is what we want
		afterName = afterName.substring(afterName.indexOf("| NAME"));
		afterName = afterName.substring(afterName.indexOf("NAME"), afterName.indexOf("\n")); //now we just have the NAME line
		if (afterName.indexOf("=") > -1) //contains the necessary equal sign
		{
		    var afterEq = afterName.substring(afterName.indexOf("=") + 1); //get everything after the equals sign
		    while (afterEq.length > 0 && afterEq.charAt(0) == ' ') //while beginning of string is whitespace
			afterEq = afterEq.substring(1); //remove whitespace
		    if (afterEq == null || afterEq.length == 0) //no name is present
		    {
			name = document.URL;
			if (name.indexOf("https") > -1)
			    name = name.split("https://en.wikipedia.org/w/index.php?title=")[1];
			else
			    name = name.split("http://en.wikipedia.org/w/index.php?title=")[1];
			name = name.split("&action=edit")[0];
			while (name.indexOf("_") > -1)
			    name = name.replace("_"," ");
			name = name.replace("&action=submit","");

			String.prototype.countWords = function(){
			    return this.split(/\s+/).length;}

			if (name.indexOf("%C3%A1") > -1) name=name.replace("%C3%A1","á");
			if (name.indexOf("%C4%87") > -1) name=name.replace("%C4%87","ć");
			if (name.indexOf("%C5%82") > -1) name=name.replace("%C5%82","ł");
			if (name.indexOf("%C3%B3")> -1) name=name.replace("%C3%B3","ó");
			if (name.indexOf("%C5%9B") > -1) name=name.replace("%C5%9B","ś");
			if (name.indexOf("%C3%BC") > -1) name=name.replace("%C3%BC","ü");
			if (name.indexOf("%C5%BE") > -1) name=name.replace("%C5%BE","ž");
			if (name.indexOf("%C5%A0") > -1) name=name.replace("%C5%A0","Š");
			if (name.indexOf("%E2%80%93")>-1)name=name.replace("%E2%80%93","–");
			if (name.indexOf("%27")    > -1) name=name.replace("%27","'");

			if (name.countWords() == 1 || name.indexOf(" of ") > -1 || name.indexOf(" the ") > -1)
			    name = name;

			else if (name.countWords() == 2)
			{
			    var firstName = name.split(" ")[0];
			    var lastName = name.split(" ")[1];
			    if (lastName.charAt(0) == "(")
			    {var reversed = name;}
			    else
			    {var reversed = lastName.concat(", ").concat(firstName);}
			    name = reversed;
			}

			else if (name.countWords() == 3)
			{
			    var firstName = name.slice(0,name.indexOf(" "));
			    var midName   = name.split(" ")[1];
			    var lastName  = name.split(" ")[2];

			    if (midName == "of" || midName == "the")
			    {  var reversed = name;}

			    else if (lastName.charAt(0) == "(")
			    {var reversed = midName.concat(", ").concat(firstName).concat(" ").concat(lastName);}

			    else
			    {var reversed = lastName.concat(", ").concat(firstName).concat(" ").concat(midName);}

			    name = reversed;
			}

			else if (name.countWords() == 4)
			{
			    var firstName = name.slice(0,name.indexOf(" "));
			    var midName   = name.split(" ")[1];
			    var lastName  = name.split(" ")[2];
			    var name4     = name.split(" ")[3];

			    if (name4.charAt(name4.length-1) != ")")
			    {var reversed = name4.concat(", ").concat(firstName).concat(" ").concat(midName).concat(" ").concat(lastName);}

			    else
			    {var reversed = midName.concat(", ").concat(firstName).concat(" ").concat(lastName).concat(" ").concat(name4);}

			    name = reversed;
			}

			sstart       = s.indexOf("{{Persondata\n| NAME") + afterNameEq; //location of '='
			eend         = sstart + 1;
			rreplacement = "= " + name;

			b.push({
			    start: sstart,
			    end: eend,
			    replacement: rreplacement,
			    name: 'missing Name in Persondata',
			    description: 'The Persondata template is missing the \"Name\" parameter.'
			});
		    }
		}
	    }

	    return b;
	});

    } // end if mw.config.get('wgContentLanguage') === 'en'

    return ARA_Rules;
}
// </nowiki>
