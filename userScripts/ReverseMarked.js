// Modified from http://en.wikipedia.org/w/index.php?title=User:Equazcion/ReverseMarked.js&oldid=502668210
// Keep "mark all" link and keep green on history pages

if (mw.config.get("wgPageName") == "Special:Watchlist") {

  $('table.mw-changeslist-line-not-watched').find('td:gt(0)').css('opacity', '0.65'); 
  $('table.mw-changeslist-line-not-watched').find('a:first').css('opacity', '0.5').css('font-style','italic').css('font-size','97%'); 
  $('table.mw-changeslist-line-watched').find('a:first').css('opacity', '1').css('font-style','normal').css('font-size','100%');
  $('table.mw-changeslist-line-watched').find('td:gt(0)').css('opacity', '1').css('font-style','normal').css('font-size','100%');

  $('li.mw-changeslist-line-not-watched').css('opacity', '0.65'); 
  $('li.mw-changeslist-line-not-watched').css('opacity', '0.5').css('font-style','italic').css('font-size','97%'); 
  $('li.mw-changeslist-line-watched').css('opacity', '1').css('font-style','normal').css('font-size','100%');
  $('li.mw-changeslist-line-watched').css('opacity', '1').css('font-style','normal').css('font-size','100%');

  //$('#mw-watchlist-resetbutton').remove();
}