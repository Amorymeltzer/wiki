// <nowiki>
//From [[User:Enterprisey/diff-permalink.js]] at [[Special:PermaLink/876699678]]
//Always put in content sub, shorten text
( function () {
    $.when( $.ready, mw.loader.using( [ "mediawiki.util" ] ) ).then( function () {
	var suffix = mw.config.get( "wgDiffNewId" );
	var page;
	if( suffix ) {
	    if( document.getElementsByClassName( "diff-multi" ).length ||
		mw.config.get("wgPageName") === "Special:ComparePages" )
		suffix = mw.config.get( "wgDiffOldId" ) + "/" + suffix;
	    page = "Special:Diff/" + suffix;
	} else {
	    var oldidMatch = mw.util.getParamValue( "oldid" );
	    if( oldidMatch ) {
		page = "Special:Permalink/" + oldidMatch;
	    } else return; // nothing to do here
	}

	var permalinkEl = $( "<input>" ).val( page )
	    .click( function () { this.select(); document.execCommand( "copy" ); } );
	permalinkEl.attr( "size", permalinkEl.val().length ); // resize to diff length
	$( "#contentSub" ).after( permalinkEl ).after( "Permalink: " );
    } );
} )();
// </nowiki>
