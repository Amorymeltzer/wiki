//From [[User:Enterprisey/diff-permalink.js]] at [[Special:PermaLink/876699678]]
//Always put in content sub, shorten text, smaller button
// <nowiki>
$.when( $.ready, mw.loader.using( [ "mediawiki.util" ] ) ).then( function () {
    var suffix = mw.config.get( "wgDiffNewId" );
    var page;
    if( suffix ) {
        if( document.getElementsByClassName( "diff-multi" ).length ||
            mw.config.get("wgPageName") === "Special:ComparePages" ) {
            suffix = mw.config.get( "wgDiffOldId" ) + "/" + suffix;
        }
        page = "Special:Diff/" + suffix;
    } else {
        var oldidMatch = mw.util.getParamValue( "oldid" );
        if( oldidMatch ) {
            page = "Special:Permalink/" + oldidMatch;
        } else return; // nothing to do here
    }

    var permalinkEl = $( "<div>" ).append(
        "Permalink: ",
        $( "<input>", { "id": "diff-permalink-link" } )
            .val( page ),
        $( "<button>" )
            .text( "Copy" )
            .css( { "padding": "0.05em", "cursor": "pointer", "margin-left": "0.5em" } )
            .click( function () {
                document.getElementById( "diff-permalink-link" ).select();
                document.execCommand( "copy" );
            } ) );
    $( "#diff-permalink-link" ).attr( "size", page.length ) // resize to diff length
    $( "#contentSub" ).after( permalinkEl );
} );
// </nowiki>
