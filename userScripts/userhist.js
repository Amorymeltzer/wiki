// Taken from [[User:Ale jrb/Scripts/userhist.js]] (as of [[Special:PermaLink/920398181]]) to tweak imports and work with [[User:Bradv/endlesscontribs.js]] (well, [[User:Amorymeltzer/endlesscontribs.js]] atm)
if (histlimit === undefined) var histlimit = 40;
if (typeof histwidth === 'undefined') var histwidth = 200;

function UserHistory() {
    var me = this;

    this.displayBox = function(user) {
        // if user is set, this name will automatically be displayed on load
        if (user == null) {
            user = '';
        } else {
            user = user.replace(/(_|%20)/gi, ' ');
            user = user.replace(/(%3A)/gi, ':');
        }

        var box = document.createElement( 'input' );
        box.setAttribute('id', 'userhist-isolate');
        box.setAttribute('type', 'text');
        box.setAttribute('value', user);
        box.setAttribute('style', 'width: ' + histwidth + 'px');

        var button = document.createElement( 'input' );
        button.setAttribute('type', 'button');
        button.setAttribute('value', 'Isolate history');
        button.setAttribute('style', 'margin-left: 4px;');

        if (button.addEventListener) {
            button.addEventListener('click', function() {
                userHist.getUserHist(document.getElementById('userhist-isolate').value);
            }, false);
        } else {
            button.attachEvent('onclick', function() {
                userHist.getUserHist(document.getElementById('userhist-isolate').value);
            });
        }

        var span = document.createElement('span');
        span.setAttribute('style','display: block; margin-top: 12px;');
        span.appendChild(box);
        span.appendChild(button);

        document.getElementById( 'mw-history-search' ).appendChild(span);
    };

    this.getUserHist = function(user) {
        var api = 'https://en.wikipedia.org/w/api.php';
        if (typeof user === 'undefined' || !user) {
            return false;
        }

        user = user.replace(/ /g, '_');
        user = user.replace(/User(:|%3A)/gi, '');

        // remove useless interface
        var histPar = document.getElementById('mw-history-compare');
        histPar.innerHTML = '<span style="padding: 4px;">isolating edits by <strong>' + user + '</strong> - please wait...</span>';

        var apiLink = '?action=query&format=xml&prop=revisions&titles='+mw.config.get('wgPageName')+'&rvprop=ids|timestamp|flags|comment|user|size&rvlimit=500&rvuser='+user+'';

        this.req = new wa_ajaxcall();
        this.req.requestUrl = api + apiLink;
        this.req.get(function() {
            userHist.data = userHist.req.response;
            userHist.showUserHist ();
            return true;
        } );
    };

    this.showUserHist = function() {
        var data = this.data;

        if (data.getElementsByTagName('rev').length <= 0) {
            this.showError('That user has never edited this page.');
            return false;
        }

        // get output
        var output = [];
        for (var i = 0; i < data.getElementsByTagName('rev').length; ++i) {
            var dataset = data.getElementsByTagName('rev')[i];

            output[i] = [];
            output[i][0] = dataset.getAttribute('revid'); // oldid
            output[i][1] = dataset.getAttribute('user'); // user
            output[i][2] = dataset.getAttribute('timestamp'); // timestamp
            output[i][3] = dataset.getAttribute('comment'); // comment
            output[i][4] = dataset.getAttribute('size'); // size
            output[i][5] = dataset.getAttribute('minor'); // minor
        }

        // build our own interface
        var newInt = '<ul id="pagehistory">';
        var url = 'https://en.wikipedia.org/w/index.php?title=' + mw.config.get('wgPageName');
        for (var j = 0; j < output.length; j ++) {
            var timestamp = me.convertTimestamp(output[j][2]);
            var comment = me.parseComment(output[j][3]);
	    var m;
            if (output[j][5] != null) {
		m = '<span class="minor">m</span> ';
	    } else {
		m = '';
	    }

            newInt = newInt + '<li class="">(<a href="'+url+'&oldid='+output[j][0]+'&diff=cur">cur</a> | <a href="'+url+'&oldid='+output[j][0]+'&diff=prev">prev</a>) <span style="padding-left: 5px;"><a href="'+url+'&oldid='+output[j][0]+'">'+timestamp+'</a></span> <span class="history-user"><a href="/wiki/User:'+output[j][1]+'">'+output[j][1]+'</a></span> '+m+'<span class="history-size">('+output[j][4]+' bytes)</span> '+comment+'</li>';
        }
        newInt += '</ul>';

        var histPar = document.getElementById('mw-history-compare');
        histPar.innerHTML = newInt;
    };

    this.showError = function(errorMessage) {
        var container = document.getElementById('mw-history-compare');
        container.innerHTML = '<span style="padding: 4px; color: #885555; font-weight: bold;">userhist error: ' + errorMessage + '</span>';

        return true;
    };

    this.convertTimestamp = function(timestamp) {
        var regTest = /([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})Z/g;
        regTest.lastIndex = 0;
        time = regTest.exec(timestamp);
        if (time == null) return 'failed to parse timestamp';

        var d = new Date();
        var hourOffset = (d.getTimezoneOffset() / 60) * -1;
        var h = parseInt( time[4], 10 ) + hourOffset;
        if  (h < 10 ) h = '0' + h;

        var months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
        var month = parseInt(time[2], 10);

        var newStamp = h + ':' + time[5] + ', ' + time[3] + ' ' + months[month-1] + ' ' + time[1];

        return newStamp;
    };

    this.parseComment = function(comment) {
        if (comment == null) return '';

        comment = comment.replace('/*', '<span class="autocomment">→');
        comment = comment.replace('*/', '</span>');

        comment = comment.replace(/\[\[(.+?)(#.+?)?(?:\|(.+?))\]\]/g, "<a href=\"/wiki/$1$2\" title=\"$3\">$3</a>");
        comment = comment.replace(/\[\[(.+?)(#.+?)?\]\]/g, "<a href=\"/wiki/$1$2\" title=\"$1\">$1</a>");

        comment = '(<span class="comment">' + comment + '</span>)';

        return comment;
    };

    this.manageSize = function() {
        var regTest = /class="history-size">\(([,0-9]+?) +?bytes\)<\/span>/ig, regMatch;
        var col = { 'add': '#006400', 'remove': '#8b0000' }, results = [], i = 0;

        while ((regMatch = regTest.exec(document.getElementById('pagehistory').innerHTML))) {
            results [ i ++ ] = parseInt(regMatch [1].replace(',', ''), 10);

            if (i > histlimit) break;
        }

        for (var i = 0, l = results.length; i < (l - 1); ++i) {
            var addition = results [i] - results [i + 1];
	    var rep;
	    if (addition === 0) {
		rep = '<span style="color: #555555; ">0</span>';
	    } else if (addition < 0) {
		rep = '<span style="color: ' + col ['remove'] + '; font-weight: bold;">' + addition + '</span>';
	    } else {
		rep = '<span style="color: ' + col ['add'] + '; font-weight: bold;">+' + addition + '</span>';
	    }

            document.getElementById('pagehistory').innerHTML = document.getElementById('pagehistory').innerHTML.replace(/class="history-size">\(([,0-9]+?) +?bytes\)<\/span>/i, "class=\"historysize\">(" + rep + ", $1 bytes)</span>");
        }
    };

    this.init = function() {
	var user;
        if (mw.config.get('wgAction') == 'history' && mw.config.get('wgArticleId')) {
            if ( ( window.location.href.indexOf('&isolate=') > -1) && (window.location.href.indexOf('&offset=') == -1) && (window.location.href.indexOf('&limit=') == -1)) {
                user = window.location.href.substr(window.location.href.indexOf('&isolate=') + 9);
                me.getUserHist(user);
            } else {
                //me.manageSize (); - FIXME: prevents the history diff selectors from working correctly
                user = '';
            }

            me.displayBox(user);
        } else if ((mw.config.get('wgAction') == 'view') && (mw.config.get('wgCanonicalSpecialPageName') == 'Contributions') && (mw.config.exists('wgRelevantUserName'))) {
            user = mw.config.get('wgRelevantUserName');
            user = mw.util.isIPAddress(user) ? user : 'User:' + user;
	    // Everything with a history link but not with this already applied
	    var list = $('.mw-changeslist-links:has(.mw-changeslist-history):not(:has(.mw-changeslist-all))');
	    list.each(function(idx, el) {
		var histNode = el.querySelector('.mw-changeslist-history');
		var span = document.createElement('span');
		span.innerHTML = "<a class=\"mw-changeslist-all\" href=\"/w/index.php?title=" + encodeURIComponent(histNode.title) + "&action=history&isolate=" + user + "\">all</a>";
		el.insertBefore(span, null);
	    });
        }
    };
}

importScript('User:Ale_jrb/Scripts/waLib.js');
var userHist = new UserHistory();
$(userHist.init);
