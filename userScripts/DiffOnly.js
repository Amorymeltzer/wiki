//Taken from https://en.wikipedia.org/w/index.php?title=User:Mr._Stradivarius/gadgets/DiffOnly.js&oldid=801071404
//[[User:Mr._Stradivarius/gadgets/DiffOnly.js]] to use "o" instead of "only" and tighten the separator
//Updated to use native URL constructor

/*                            DiffOnly
 *
 * This gadget adds a "diff only" link next to the "Next edit" and "Previous
 * edit" links on diff pages. Clicking on the "diff only" link will show you
 * the diff with no page content. These links usually load a lot faster
 * than normal diff links, which can be handy for looking through lots of diffs.
 *
 * To install it, add the following to your [[Special:MyPage/common.js]]:

 importScript('User:Mr. Stradivarius/gadgets/DiffOnly.js') // Linkback: [[User:Mr. Stradivarius/gadgets/DiffOnly.js]]

 * Note that you can choose to never show the page content when viewing diffs
 * by going to Preferences → Appearance → Diffs, and by selecting the "Do not
 * show page content below diffs" checkbox. This should be preferred over using
 * this gadget if you do not want the option to choose between diffs with and
 * without page content.
 *
 * This script is based on code by HighInBC at
 * https://en.wikipedia.org/w/index.php?title=User:HighInBC/common.js&oldid=682081230
 */

(function () {
    var DOT_SEPARATOR = '•';
    var mwConfig = mw.config.get( [
	'wgAction',
	'wgCanonicalSpecialPageName'
    ] );

    // Load user config
    var config = window.DiffOnly;
    if ( config === 'all' ) {
	config = { all: true };
    } else if ( typeof config !== 'object' ) {
	config = {};
    }
    if ( config.diff === undefined ) {
	// Turn diff page links on by default
	config.diff = true;
    }
    if ( config.all !== undefined ) {
	config.diff = config.all;
	config.history = config.all;
	config.recentchanges = config.all;
	config.watchlist = config.all;
	config.contributions = config.all;
    }

    /**************************************************************************\
     * Helper functions
	\**************************************************************************/

    // Make a diff-only link, based on the normal diff link $diffLink.
    // $diffLink should be a jQuery object consisting of exactly one <a>
    // element.
    function makeDiffOnlyLink( $diffLink, display ) {
	var diffUrl, $diffOnlyLink;

	if ( $diffLink.length !== 1 ) {
	    throw Error( 'makeDiffOnlyLink must be passed a jQuery object of length 1' );
	}
	if ( !$diffLink.attr( 'href' ) ) {
	    return;
	}

	// Make the new diff-only URL
	diffUrl = new URL( $diffLink.attr( 'href' ), window.location.origin);
	diffUrl.searchParams.set( 'diffonly', 1 );

	// Make the diff-only link
	$diffOnlyLink = $( '<a>' )
	    .attr( 'href', diffUrl.toString() )
	    .text( display );
	if ( $diffLink.attr( 'title' ) )  {
	    $diffOnlyLink.attr( 'title', $diffLink.attr( 'title' ) );
	}

	return $diffOnlyLink;
    }

    /**************************************************************************\
     * Add diff-only links to diff pages
	\**************************************************************************/

    // Handle a "Next edit" or "Previous edit" link on a diff page.
    function handleDiffPageLink( options ) {
	var $diffOnlyLink, diffUrl,
	    $diffLink = $( options.selector );

	if ( $diffLink.length !== 1 ) {
	    return;
	}

	$diffOnlyLink = makeDiffOnlyLink( $diffLink, 'diff only' );

	// Add the diff-only link and the arrow.
	$diffLink.parent()
	    .append( DOT_SEPARATOR )
	    .append( $diffOnlyLink )
	[ options.jqueryMethod ]( ' ' )
	[ options.jqueryMethod ]( options.arrow );

	// The standard diff links on diff pages have the arrow inside the <a>
	// element. However, we don't want that, as it looks wrong when we
	// introduce the other link. To fix it, we set the text again.
	//
	// Also, if we navigated to this diff page from a diff-only link, then
	// the standard diff link will have a diffonly parameter. We don't want
	// to have two diff-only links, so we delete the diffonly parameter
	// in the original diff link.
	diffUrl = new URL( $diffLink.attr( 'href' ), window.location.origin );
	diffUrl.searchParams.delete('diffonly');
	$diffLink
	    .attr( 'href', diffUrl.toString() )
	    .text( options.diffLinkDisplay );
    }

    if ( config.diff ) {
	handleDiffPageLink( {
	    selector: '#differences-prevlink',
	    jqueryMethod: 'prepend',
	    diffLinkDisplay: 'Previous edit',
	    arrow: '←'
	} );
	handleDiffPageLink( {
	    selector: '#differences-nextlink',
	    jqueryMethod: 'append',
	    diffLinkDisplay: 'Next edit',
	    arrow: '→'
	} );
    }

    /**************************************************************************\
     * Add diff-only links to lists of changes
	\**************************************************************************/

    // Handle a page with multiple diffs on, like Special:RecentChanges,
    // Special:Watchlist, or history pages.
    // The selector should select all the diff links on the page.
    function handleChangeList( selector ) {
	$( selector ).each( function () {
	    // Make the diff-only link
	    var $diffLink = $( this );
	    var $diffOnlyLink = makeDiffOnlyLink( $diffLink, 'o' );

	    // Insert the diff only link after the diff link, and then separate
	    // them with the dot-separator.
	    $diffLink.after( $diffOnlyLink );
	    $diffLink.after( DOT_SEPARATOR );
	} );
    }

    // Handle history diff links
    if ( config.history && mwConfig.wgAction == "history" ) {
	handleChangeList( '.mw-history-histlinks a' );
    }

    // Handle recent changes and watchlist diff links
    if ( config.recentchanges && mwConfig.wgCanonicalSpecialPageName == "Recentchanges"
	 || config.watchlist && mwConfig.wgCanonicalSpecialPageName == 'Watchlist'
	 || config.contributions && mwConfig.wgCanonicalSpecialPageName == 'Contributions')
    {
	handleChangeList( '.mw-changeslist-diff' );
    }
} )();
