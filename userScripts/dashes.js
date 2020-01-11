//Taken from https://en.wikipedia.org/w/index.php?title=User:GregU/dashes.js&oldid=809572619
//Remove standalone hook, thus removing duplicate - menu

//  Fix hyphens, dashes, and minus signs per [[MOS:DASH]].
//
//  See talk page for instructions.
//
//  The user can disable these conversions by putting "nodashes" somewhere
//  in the text — either temporarily or permanently.  You can similarly add
//  "scores" if the score-detection heuristic doesn't trigger automatically.
//
//  This tool can be used standalone until it is added to AutoEd and wikEd.
//  This module should follow unicodify.js if it is used.
//  Testing page is at [[User:GregU/dashes.js/tests]].
//  Please report false positives on the talk page.

function autoEdDashes (str)
{
    if (str.search(/nodashes/i) >= 0)
	return str;

    var scpat = /\bscores?\b|\[\[Category:.*\b(sport|athlet|players|teams|games|league|champion|tournament|competit|cup\b|\w+ball\b|hockey|lacrosse|cricket|rugby|tennis|golf|polo|boxing|boxers|martial.art|chess)/i;
    var scoresAreLikely = (str.search(scpat) >= 0);

    // Ensure the replacement isn't a link such as [[FOO - BAR]] before
    // replacing it, so that we don't break the link. But we do want to
    // replace dashes used in the right-side label part of links.  Also,
    // don't break templates, URLs, DOIs, {{#expr:}}, <math> equations,
    // source code, or <ref name="13-70">.
    //
    function ifNotLink (str)
    {
	var pos    = arguments[ arguments.length - 2 ];
	var string = arguments[ arguments.length - 1 ];

	var pat = /\[\[[^|\]]*$|\{\{[^|}]*$|[:\/%][^\s|>]+$|<[^>]*$|#\w*expr:.*$/i;
	if (string.substring(pos-260,pos+1).search(pat) >= 0)
	    return str;             // it's a link, so don't change it

	var pat2 = /\{\{(main|see|detail|about|for\b|other|redir|conv|coor|sort|anchor|DNB(?: [Cc]ite|)|[Cc]ite DNB)[^}]*$/i;
	if (string.substring(pos-260,pos+1).search(pat2) >= 0)
	    return str;             // likely templates with page-name or neg params

	var pat3 = /\|\s*(CAS_number)\s*=\s*/i;
	if (string.substring(pos-260,pos+1).search(pat3) >= 0)
	    return str;             // drugbox CAS_number

	var pat4 = /\|\s*(doi|isbn)\s*=\s*/i;
	if (string.substring(pos-260,pos+1).search(pat4) >= 0)
	    return str;             // doi or isbn

	var m = string.slice(pos).search(/<\/?(math|pre|code|tt|source|syntaxhighlight|gallery)\b/i);
	if (m >= 0 && string.charAt(pos+m+1) == '/')
	    return str;             // don't break a <math> equation, or source code

	if (string.slice(pos).search(/^[^|{}[\]<>\n]*\.([a-z]{3,4}\s*[|}]|jpg|png|svg)|^.*hyphen/i) >= 0)
	    return str;             // it's a file name parameter, or <!--sic hyphen-->

	if (str.search(/[ |(>][-–]\b/) >= 0)
	    return str.replace(/[-–]/, "−");       // minus sign
	else
	    return str.replace(/--+\b/g, "—") . replace(/[-–−]+/g, "–");     // dash
    }

    str = str.replace(/\s--?\s/g, ifNotLink);                 // en dash looks better
    str = str.replace(/[a-z\d]---?[a-z\d]/ig, ifNotLink);     // em dash
    str = str.replace(/\d\d\d]*}*[-−](present|current)\b/ig, ifNotLink);       // 1973-present
    str = str.replace(/[^\w−-](18|19|20)\d\d]*}*[-−][^\w−-]/g, ifNotLink);     // (1973-)
    str = str.replace(/\d(s|%|\?|''')[-−]\d/g, ifNotLink);    // 1950s-1960s, 40%-50%
    str = str.replace(/\d[-−](\$|'+)\d/g, ifNotLink);         // $40-$50, 7-'''4''', '49-'53
    str = str.replace(/[½⅓⅔¼¾⅛⅜⅝⅞]%?[-−][\d½⅓⅔¼¾⅛⅜⅝⅞]/g, ifNotLink);           // 3½-6
    str = str.replace(/\d(st|nd|rd|th)?[-−]\d+(st|nd|rd|th)\b/g, ifNotLink);   // 2nd-3rd

    str = str.replace(/([a-z,'"”\]>] +|\(|^\| *|\|\| *)[-–]\d/mig, ifNotLink);   // minus -35
    str = str.replace(/<((sup|sub|td)>\s*)[-–](\d)/ig, "<$1−$3");         // 10<sup>-3</sup>
    str = str.replace(/,*(?=.? ) *[-–—−] *(\d*:\d\d[\s*<])/g, " – $1");   // album track listings

    // November 15, 2005-March 7, 2006; [[March 18]]-[[April 4]]
    str = str.replace(/(\d\]*)[-–—−](\[*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* +\d)/g, "$1 – $2");
    // July-August 2007
    str = str.replace(/\b((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-−]?\b){2,}/g, ifNotLink);
    // [[266]]-[[283]]
    str = str.replace(/(\d(?: BC)?\]\])[-−]((ca?\.|AD ?)?\[\[\d+[^\d-])/g, "$1–$2");
    // (1984 – 1992)
    str = str.replace(/([(|=] *\[*\d+\]*) +[–—−] +(\[*\d+\]*\s*[)|}])/g, "$1–$2");
    // iv-xii
    str = str.replace(/[ ;(=](?=\w+-)(m*(cm|cd|d?c*)(xc|xl|l?x*)(ix|iv|v?i*)-?\b){2}[^\w-]/g, ifNotLink);

    if (scoresAreLikely)      // W-L-D or 73–70–67–70=280, but not castling
	str = str.replace(/[^\w−–-](?!0-0-0)(\d\d?\d?[-–−]){2,}\d\d?[^\w\/−–-]/g, ifNotLink);

    str = str.replace(/\b(\d+)[–−](year|month|day|hour|minute|mile|yard|foot|inch|bit|door|speed|gun|page|seat|way|point|ton|man)\b/g, "$1-$2");     // hyphen

    // Number ranges and scores should use en dashes, per [[MOS:DASH]].
    // This has been well-tested and false positives (e.g., ID nos.) are rare.
    //
    function range (str, from,to, pos,string)
    {
	var dash   = true;
	var except = /\b(fig(ure)?|table|example|exhibit|circular|section|part|number|no|nr|id|model|pub|std|report|rpt|law|[P.]L|p|page|date|IS\wN\b[ a-z]*|SCOTUS)[^\w(,;]*$/i;
	var rpat   = /^([^A-Za-z]|nbsp)*(AD|BC|B?CE|BP|[kMG]a|km|mi|kg|lb|\w?Hz|vote|decision|record|odds|scor\w*|win|loss|tie|draw|lead|victory|defeat|upset|run|deficit|start|finish|season|game)\b/;
	var lpat   = /\b(pages|pp|rp|nos|\d+\)?'*[:,]|(w[io]n|lost?|tie|dr.w|lea?d|f.ll|vot|rul|decid|pass|fail|defeat|scor|gam|match|trail|finish|end)e?[ds]?|\w\w+ing|ahead|behind|up|down|from|to|is|are|was|were|of|out|by|an?|at|it|went|go|gone|beaten|between)([^a-z]|nbsp)*$/i;
	var inorder   = (to-0 > from.slice(-to.length));     // pp 362-5
	var precision = Math.max( from.search(/0*$/), to.search(/0*$/) );

	if (string.substring(pos-20,pos+1).search(except) >= 0) {
	    return str;      // based on preceding word, looks like a ref number
	}
	if (from == 9 && to == 11) {
	    dash = false;    // 9-11 is a common special case
	}
	if (from-0 >= to) {
	    dash = false;    // values don't look like a range
	}
	if (to-from > 120 && from * (precision > 2 ? 5 : 50) < to && from > 1) {
	    dash = false;    // values don't look like a range
	}
	if (scoresAreLikely && from <= 900 && to <= 900) {
	    dash = true;     // likely a score or wins-losses
	}
	if (from < 2-to && string.search(/Category:.*\bChess\b/i) >= 0) {
	    dash = false;    // chess notations 0-0, 0-1, 1-0
	}
	if (str.charAt(0) == '(' && string.charAt(pos + str.length) == ')') {
	    dash = true;     // scores often seen as (8-4)
	}
	if (from.search(/^0./) >= 0 || to.search(/^0./) >= 0) {
	    dash = false;    // 3-07 and 0123-4567 look like ref numbers
	}
	if (string.substr(pos-1,15).search(/^\d([:,.])\d+.\d+\1\d/) >= 0) {
	    dash = true;     // 10:30-11:30, 35,000-40,000, 2.5-4.0
	}
	if (string.substr(pos,30).search(rpat) >= 0) {
	    dash = true;     // 12-5 BC, 5-5000&nbsp;km, 6-4 win, 73-50 vote
	}
	if (string.substring(pos-80,pos).search(lpat) >= 0) {
	    dash = true;     // pp.&nbsp;8, 25, 270-74, 313-7; won 6-4, 6-2
	}
	if (from > 1000 && from < 2100 && to.length == 2 && inorder) {
	    dash = true;     // 1994-95 year range
	}
	return dash ? ifNotLink(str,pos,string) : str;
    }

    str = str.replace(/[^\w\/+−–-](\d{1,4})[-−](\d{1,4})(?!'*[\w\/+−–-])/g, range);

    return str;
}
