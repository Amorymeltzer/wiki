// Make the buttons on history pages links that you can click, such as for
// opening in a new tab.  Simply removes the click event, which apparently
// makes them nice links again. See also [[User:Mattflaschen/Compare link.js]].

if (mw.config.get('wgAction') === 'history') {
	$('input.historysubmit').off('click'); // Compare link
	$('button.historysubmit').off('click'); // Sysop links
}
