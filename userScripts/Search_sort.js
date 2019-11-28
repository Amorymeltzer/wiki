/* Taken from [[User:PrimeHunter/Search_sort.js]] as of [[Special:Permalink/882034346]]
 * Tweaked to put into cactions, not toolbar
 * Tweak order and shorten links
 */

/* Add several "Sort by" links to search pages.
   Click one of them to repeat the search with the given sorting.
   Install with this in your [[Special:MyPage/common.js]]:

   importScript('User:PrimeHunter/Search_sort.js'); // Linkback: [[User:PrimeHunter/Search sort.js]]
*/

$( document ).ready( function() {
if ( mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Search'){
  mw.util.addPortletLink(
    'p-cactions',
    'https://en.wikipedia.org/w/index.php?title=Wikipedia:Village_pump_(technical)&oldid=882024973#Sorting_search_results',
    'Sort by:',
    't-sort',
    'View post about the search sort feature the following links are using'
  );
  mw.util.addPortletLink(
    'p-cactions',
    location.href.replace( location.hash, '' ) + ( location.search ? '&' : '?' ) + 'sort=last_edit_desc',
    'Edited (desc)',
    't-sort',
    'Repeat the search with sort by last edited descending'
  );
  mw.util.addPortletLink(
    'p-cactions',
    location.href.replace( location.hash, '' ) + ( location.search ? '&' : '?' ) + 'sort=last_edit_asc',
    'Edited (asc)',
    't-sort',
    'Repeat the search with sort by last edited ascending'
  );
  mw.util.addPortletLink(
    'p-cactions',
    location.href.replace( location.hash, '' ) + ( location.search ? '&' : '?' ) + 'sort=create_timestamp_desc',
    'Creation (desc)',
    't-sort',
    'Repeat the search with sort by page creation descending'
  );
  mw.util.addPortletLink(
    'p-cactions',
    location.href.replace( location.hash, '' ) + ( location.search ? '&' : '?' ) + 'sort=create_timestamp_asc',
    'Creation (asc)',
    't-sort',
    'Repeat the search with sort by page creation ascending'
  );
  mw.util.addPortletLink(
    'p-cactions',
    location.href.replace( location.hash, '' ) + ( location.search ? '&' : '?' ) + 'sort=incoming_links_asc',
    'Least backlinks',
    't-sort',
    'Repeat the search with sort by least amount of incoming links'
  );
  mw.util.addPortletLink(
    'p-cactions',
    location.href.replace( location.hash, '' ) + ( location.search ? '&' : '?' ) + 'sort=incoming_links_desc',
    'Most backlinks',
    't-sort',
    'Repeat the search with sort by highest amount of incoming links'
  );
  mw.util.addPortletLink(
    'p-cactions',
    location.href.replace( location.hash, '' ) + ( location.search ? '&' : '?' ) + 'sort=just_match',
    'Match relevance',
    't-sort',
    'Repeat the search with sort by direct text match relevance (no boosts and penalties for certain pages, like in default relevance)'
  );
  mw.util.addPortletLink(
    'p-cactions',
    location.href.replace( location.hash, '' ) + ( location.search ? '&' : '?' ) + 'sort=relevance',
    'Relevance (default)',
    't-sort',
    'Repeat the search with sort by relevance (default)'
  );
  mw.util.addPortletLink(
    'p-cactions',
    location.href.replace( location.hash, '' ) + ( location.search ? '&' : '?' ) + 'sort=none',
    'Unsorted',
    't-sort',
    'Repeat the search completely unsorted'
  );
}
});