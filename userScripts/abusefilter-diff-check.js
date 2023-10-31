//Taken from https://en.wikipedia.org/w/index.php?title=User:Enterprisey/abusefilter-diff-check.js&oldid=1047870553
//Work on Modern skin [[User:Enterprisey/abusefilter-diff-check.js]]


( function () {

    // thanks https://stackoverflow.com/a/26434619/1757964
    function parseTimestamp( timestamp ) {
        var dt = timestamp.split( /[: T-]/ ).map( parseFloat );
        return new Date( Date.UTC( dt[0], dt[1] - 1, dt[2], dt[3] || 0, dt[4] || 0, dt[5] || 0, 0 ) );
    }

    if( mw.config.get( "wgDiffOldId" ) && mw.config.get( "wgDiffNewId" ) ) {
        $.when( mw.loader.using( [ "mediawiki.api", "mediawiki.util" ] ), $.ready ).then( function () {
            var api = new mw.Api();
            function getUsernameAndTimestamp() {
                var username = $( "#mw-diff-ntitle2 .mw-userlink" ).text();
                return api.get( {
                    action: "query",
                    prop: "revisions",
                    titles: mw.config.get( "wgPageName" ),
                    rvstartid: mw.config.get( "wgDiffNewId" ),
                    rvendid: mw.config.get( "wgDiffOldId" ),
                    rvlimit: 1,
                    rvprop: "timestamp|ids",
                    formatversion: "2",
                } ).then( function ( data ) {
                    var timestamp = data.query.pages[0].revisions[0].timestamp;
                    return $.when( username, timestamp );
                } );
            }

            var link = mw.util.addPortletLink( "p-cactions", "#",
                "AbuseFilter hits?", "pt-abusefilter-examine",
                "Check if this diff triggered any abuse filters when it was made" );
            if( link ) {
                link.addEventListener( "click", function () {
                    getUsernameAndTimestamp().then( function ( username, timestamp ) {
                        api.get( {
                            action: "query",
                            list: "abuselog",
                            afluser: username,
                            afltitle: mw.config.get( "wgPageName" ).replace( /_/g, " " ),
                            aflend: timestamp,
                        } ).then( function ( data ) {
                            var stringDiffNewId = mw.config.get( "wgDiffNewId" );
                            var entries = ( data.query.abuselog || [] ).filter( function ( entry ) {
                                return ( "" + entry.revid ) === stringDiffNewId ||

                                    // Sometimes an abuse filter entry can have a different timestamp than the triggering edit
                                    Math.abs( parseTimestamp( entry.timestamp ) - timestamp ) < 10000; // 10 seconds
                            } );
                            $( "#contentSub" ).prepend( $( "<p>" )
                                .append( "Filter hits: ", entries.length ? entries.map( function ( entry ) {
                                    return "<a href='" + mw.util.getUrl( "Special:AbuseFilter/" + entry.filter_id ) + "'>" + entry.filter_id + "</a> (<a href='" + mw.util.getUrl( "Special:AbuseLog/" +
                                        entry.id ) + "'>details</a> | <a href='" +
                                        mw.util.getUrl( "Special:AbuseFilter/examine/log/" + entry.id ) + "'>examine</a>)";
                                } ).join( ", " ) : "none" ) );
                        } );
                    } );
                } );
            }

            getUsernameAndTimestamp().then( function ( username, timestamp ) {
                var url = mw.util.getUrl( "Special:AbuseFilter/test", {
                    abusefilter_test_username: username,
                    abusefilter_test_timestamp: timestamp,
                    abusefilter_test_page: mw.config.get( "wgPageName" )
                } );
                mw.util.addPortletLink( "p-cactions", url, "AbuseFilter test", "pt-abusefilter-test",
                    "Open this diff in the AbuseFilter testing interface" );
            } );
        } );
    } else if( mw.config.get( "wgPageName" ) === "Special:AbuseFilter/test" &&
            window.location.search.indexOf( "abusefilter_test_username" ) >= 0 ) {
        $( function () {
            var username = window.location.search.match( /abusefilter_test_username=(.+?)($|&)/ )[1];
            var timestamp = window.location.search.match( /abusefilter_test_timestamp=(.+?)($|&)/ )[1];
            var page = window.location.search.match( /abusefilter_test_page=(.+?)($|&)/ )[1];
            var timestampValue = parseTimestamp( decodeURIComponent( timestamp ) ).getTime();

            // 30-second window in either direction to make sure we catch the edit
            var prevTimestamp = new Date( timestampValue - 30000 );
            var nextTimestamp = new Date( timestampValue + 30000 );

            $( "#ooui-php-5" ).val( username );

            // "Changes made after" field
            OO.ui.infuse( $( "#ooui-php-14" ) ).fieldWidget.setValue( prevTimestamp );

            // "Changes made before" field
            OO.ui.infuse( $( "#ooui-php-15" ) ).fieldWidget.setValue( nextTimestamp );

            $( "#ooui-php-9" ).val( decodeURIComponent( page ) );
        } );
    }
} )();
