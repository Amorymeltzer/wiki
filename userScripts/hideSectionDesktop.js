//Taken from [[User:BethNaught/hideSectionDesktop.js]] at [[Special:PermaLink/852866025]]
//Avoid loading on inappropriate pages (i.e., without wikitext (action=edit, js/css contentmodel))
//Shorten text and don't use document.ready (creates ugly spaces with [[User:The Earwig/permalink.js]])

/**
 * This script adds a [toggle visibility] link to level 2 section headers.
 * The link does what it says on the tin.
 * No promise of accuracy or non-brokenness made.
 * Tested in Vector and Monobook. Last test: 2018-07-12.

 * To install, add the following to your commmon.js or skin.js:

 mw.loader.load('//en.wikipedia.org/w/index.php?title=User:BethNaught/hideSectionDesktop.js&action=raw&ctype=text/javascript'); // Backlink: [[User:BethNaught/hideSectionDesktop.js]]

 * Author: [[User:BethNaught]]

 * Category: [[Category:Wikipedia scripts]]
 */

/** global $ */
if (document.getElementsByClassName('mw-parser-output').length) {
    $(function() {
	// Helper functions
	function _toggleVisibility(elt) {
	    if (elt.style.display == "none") {
		elt.style.display = "";
	    } else {
		elt.style.display = "none";
	    }
	}
	function _createToggleVisibilityLink(sectionID) {
	    // Create HTML
	    var out = document.createElement('span');
	    out.classList.add('mw-editsection');

	    var left = document.createElement('span');
	    var right = document.createElement('span');
	    left.classList.add('mw-editsection-bracket');
	    right.classList.add('mw-editsection-bracket');
	    var leftBracket = document.createTextNode("[");
	    var rightBracket = document.createTextNode("]");
	    left.appendChild(leftBracket);
	    right.appendChild(rightBracket);

	    var center  = document.createElement('a');
	    center.classList.add('nonimage');
	    center.title = 'Toggle visibility: ' + sectionID;
	    var centerText = document.createTextNode("hide");
	    center.appendChild(centerText);
	    center._classToToggleSelector = '.bn-hidesection-' + sectionID;

	    out.appendChild(left);
	    out.appendChild(center);
	    out.appendChild(right);

	    // Event listener
	    center.addEventListener("click", function() {
		$(this._classToToggleSelector).each( function() {
		    _toggleVisibility(this);
		});
	    });
	    return out;
	}

	// BEGIN WORKFLOW
	// This hold the stuff that comes from wikitext, and that only
	var parserOutput = document.getElementsByClassName('mw-parser-output')[0];

	// Initialise loop variables
	var classifying = false;
	var sectionID = 0;
	var temp_a, currentChild;
	var loopLength = parserOutput.children.length;

	// Loop over children adding necessary stuff
	for (var i = 0; i < loopLength; i++){
	    currentChild = parserOutput.children[i];
	    if (currentChild.nodeName.toLowerCase() == "h2") {
		classifying = true;  // all subsequent elements need modifying
		sectionID += 1;
		temp_a = _createToggleVisibilityLink(sectionID);
		currentChild.appendChild(temp_a);
	    } else if (classifying) {
		currentChild.classList.add('bn-hidesection-' + sectionID);
	    }
	}
    });
}
