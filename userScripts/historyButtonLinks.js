// Make the buttons on history pages act as links that you can click and open
// in a new tab.  Simply removes the click event, which apparently makes them
// nice links again. See also [[User:Mattflaschen/Compare link.js]].

if (mw.config.get('wgAction') === 'history') {
	// Compare link
	$('input.historysubmit').on('click', function(e) {
		e.stopImmediatePropagation();
	});
	// Sysop links
	$('button.historysubmit').on('click', function(e) {
		e.stopImmediatePropagation();
	});
}
