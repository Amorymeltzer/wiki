//Taken from https://en.wikipedia.org/w/index.php?title=User:Caorongjin/wordcount.js&oldid=824278379
//Remove monobook/vector chauvinism
//
//<nowiki>
// This code is based on https://en.wikipedia.org/wiki/User:Dr_pda/prosesize.js
// but adds CJK support (http://stackoverflow.com/questions/2315488) and support
// for references and other lists.
//
function getWordCount(html) {
    var str = html.innerHTML.replace(/(<([^>]+)>)/ig,"").trim();

    var wordCount = 0;

    var arr = str.match(/[\u3040-\u309F]|[\u30A0-\u30FF]|[\u4E00-\u9FFF\uF900-\uFAFF\u3400-\u4DBF]|\S+/g);

    if (arr) {
	wordCount = arr.length;
    }

    return wordCount;
}

function getContentDiv() {
    var contentDiv;

    if (mw.config.get('wgAction') == 'edit') {
	contentDiv = document.getElementById('wikiPreview');
    }
    else {
	contentDiv = document.getElementById('mw-content-text');
    }

    return contentDiv;
}

function isValidListNode(node) {
    if (node.parentElement.id == "word-count-stats") {
	return false;
    }

    if (node.className.indexOf("toclevel-") > -1 ||
	node.parentElement.parentElement.id == "toc") {

	return false;
    }

    if (node.parentElement.parentElement.parentElement.className == "catlinks") {
	return false;
    }

    var bodyContent = getContentDiv();
    var curNode = node.parentElement.parentElement;

    while (curNode && (curNode != bodyContent)) {
	if (curNode.className.indexOf("infobox") > -1) {
	    return false;
	}
	else if (curNode.className.indexOf("metadata") > -1) {
	    return false;
	}
	else if (curNode.className.indexOf("navbox") > -1) {
	    return false;
	}
	else {
	    curNode = curNode.parentElement;
	}
    }

    return true;
}

function isValidParagraphNode(node) {
    if (node.parentNode.className == 'mw-parser-output' ||
	node.parentNode.nodeName == "BLOCKQUOTE" ) {

	return true;
    }
    else {
	return false;
    }
}

function isValidReferenceNode(node) {
    var bodyContent = getContentDiv();
    var curNode = node.parentElement;

    while (curNode && (curNode != bodyContent)) {
	if (curNode.classList.contains("references") ||
	    curNode.classList.contains("reflist") ||
	    curNode.classList.contains("refbegin")) {

	    return true;
	}

	curNode = curNode.parentElement;
    }

    return false;
}

function toggleWordCount() {
    if (mw.config.get('wgAction') == 'edit') {
	var wikiPreview = document.getElementById('wikiPreview');

	var wikiPreviewStyle = window.getComputedStyle(wikiPreview);

	if (wikiPreviewStyle.display === 'none') {
	    alert("You need to preview the text for the word count script to work in edit mode.");

	    return;
	}
    }

    var bodyContent = getContentDiv();

    var output = document.getElementById("word-count-stats");

    if (output) {
	var oldStyle = output.className;

	var i = 0;

	// Cleanup background color
	var pList = bodyContent.getElementsByTagName("p");

	if (pList) {
	    for (i=0; i < pList.length; i++){
		if (isValidParagraphNode(pList[i])) {
		    pList[i].style.cssText = oldStyle;
		}
	    }
	}

	var listTypes = ["li", "dd"];

	for (var j = 0; j < listTypes.length; j++) {
	    var liList = bodyContent.getElementsByTagName(listTypes[j]);

	    if (liList) {
		for (i=0; i < liList.length; i++) {
		    liList[i].style.cssText = oldStyle;
		}
	    }
	}

	var hList = bodyContent.getElementsByClassName("mw-headline");

	if (hList) {
	    for (i=0; i < hList.length; i++) {
		hList[i].style.cssText = oldStyle;
	    }
	}

	// Remove nodes
	output.parentNode.removeChild(output);

	var header = document.getElementById("word-count-header");

	header.parentNode.removeChild(header);
    }
    else {
	getStatistics(bodyContent);
    }
}

//
// Main counting function
//
function getStatistics(bodyContent) {

    // Statistics
    var output = document.createElement("ul");
    output.id = "word-count-stats";

    var main_body_value = document.createElement("li");
    main_body_value.id = "main-body-stat";
    output.appendChild(main_body_value);
    output.className = bodyContent.getElementsByTagName("p").item(0).style.cssText;

    var ref_value = document.createElement("li");
    ref_value.id = "ref-stat";
    output.appendChild(ref_value);

    var total_value = document.createElement("li");
    total_value.id = "total-stat";
    output.appendChild(total_value);

    bodyContent.insertBefore(output, bodyContent.firstChild);

    // Header
    var header = document.createElement("span");
    header.id = "word-count-header";
    header.innerHTML = "<br/><b>Word counts</b> (<a href='https://en.wikipedia.org/wiki/User:Caorongjin/wordcount'>doc</a>)<b>:</b>";
    bodyContent.insertBefore(header,output);

    // Create counters
    var main_body_count = 0;
    var ref_count = 0;

    var i = 0;

    // Count within paragraphs
    var pList = bodyContent.getElementsByTagName("p");

    if (pList) {
	for (i=0; i < pList.length; i++) {
	    var para = pList[i];

	    if (isValidParagraphNode(para)) {
		var paraCount = getWordCount(para);

		if (paraCount > 0) {
		    main_body_count += paraCount;
		    para.style.cssText = "background-color:yellow";
		}
	    }
	}
    }

    // Count within lists
    var listTypes = ["li", "dd"];

    for (var j = 0; j < listTypes.length; j++) {
	var liList = bodyContent.getElementsByTagName(listTypes[j]);

	if (liList) {
	    for (i=0; i < liList.length; i++) {
		var li = liList[i];

		if (isValidReferenceNode(li)) {
		    ref_count += getWordCount(li);
		    li.style.cssText = "background-color:cyan";
		}
		else if (isValidListNode(li)) {
		    main_body_count += getWordCount(li);
		    li.style.cssText = "background-color:yellow";
		}
	    }
	}
    }

    // Count within headings
    var hList = bodyContent.getElementsByClassName("mw-headline");

    if (hList) {
	for (i=0; i < hList.length; i++) {
	    var h = hList[i];

	    if (h.id == "Contents") {
		continue;
	    }

	    main_body_count += getWordCount(h);
	    h.style.cssText = "background-color:yellow";
	}
    }

    main_body_value.innerHTML = "Main body: " + main_body_count + " words";
    ref_value.innerHTML = "References: " + ref_count + " words";
    total_value.innerHTML = "Total: " + (main_body_count + ref_count) + " words";
}

jQuery(function () {
    mw.loader.using( ['mediawiki.util'], function () {
	if($.inArray(mw.config.get('wgAction'), ['edit', 'view' , 'submit' , 'historysubmit' , 'purge']) !== -1) {
	    $( mw.util.addPortletLink('p-tb', '#', 'Word count', 't-word-count', 'Calculate word count') )
		.click( toggleWordCount );
	}
    });
});

//</nowiki>
