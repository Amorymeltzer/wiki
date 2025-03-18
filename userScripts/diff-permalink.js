//From [[User:Enterprisey/diff-permalink.js]] at [[Special:PermaLink/876699678]]
//Always put in content sub, shorten text, smaller button
// <nowiki>
$.when( $.ready, mw.loader.using( [ "mediawiki.util" ] ) ).then( function () {
    var suffix = mw.config.get( "wgDiffNewId" );
    var page;
    if( suffix ) {
        if( document.getElementsByClassName( "diff-multi" ).length ||
            mw.config.get("wgCanonicalSpecialPageName") === "ComparePages" ) {
            suffix = mw.config.get( "wgDiffOldId" ) + "/" + suffix;
        }
        page = "Special:Diff/" + suffix;
    } else {
        // If "oldid" is present in the URL, show an appropriate rev id there as well.
        if( mw.util.getParamValue( "oldid" ) ) {
            page = "Special:Permalink/" + mw.config.get( "wgRevisionId" );
        } else return; // nothing to do here
    }

    var permalinkEl = $( "<div>" ).append(
        "Permalink: ",
        $( "<input>" )
        .attr( { "id": "diff-permalink-link" } )
            .val( page ),
        $( "<button>" )
            .text( "Copy" )
            .css( { "padding": "0 0.5em", "cursor": "pointer", "margin-left": "0.5em" } )
	    .attr( { "class": "mw-userscript-diff-permalink" } )
            .click( function () {
                document.getElementById( "diff-permalink-link" ).select();
                document.execCommand( "copy" );
            } ) );

    $( "#diff-permalink-link" ).attr( "size", page.length ); // resize to diff length

    $( "#contentSub" ).after( permalinkEl );
} );
// </nowiki>
