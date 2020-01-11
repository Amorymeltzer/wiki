//<nowiki>
/*jshint maxerr:999*/
/*
  Blantantly taken from [[User:Evad37/RPPhelper.js]] and [[User:MusikAnimal/userRightsManager.js]]
  Finished and fixed the former and smashed in the latter's functions
  [[Special:PermaLink/789225003]] and [[Special:PermaLink/840631689]]
  Quickly reply to simple requests on [[WP:RFPP]]
  Hopefully improved upon

  TODO
  - Enable show/hide (prob requires class in rfpp)
  - Clean up duplication
*/



mw.loader.using( ['mediawiki.util', 'mediawiki.api', 'mediawiki.notify', 'mediawiki.Title', 'oojs-ui-core', 'oojs-ui-widgets', 'oojs-ui-windows'], function () {
    //Extend oojs-ui with some useful shortcuts
    OO.ui.Element.prototype.show = function(){ this.toggle(true); };
    OO.ui.Element.prototype.hide = function(){ this.toggle(false); };
    OO.ui.Element.prototype.setPluralLabel = function() { this.setLabel( this.getLabel() + "s" ); };
    OO.ui.Element.prototype.setPluralData = function() { this.setData( this.getData() + "s" ); };
    OO.ui.Element.prototype.setSingularLabel = function() { this.setLabel( this.getLabel().slice(0,-1) ); };
    OO.ui.Element.prototype.setSingularData = function() { this.setData( this.getData().slice(0,-1) ); };
    OO.ui.FieldLayout.prototype.appendInlineLabel = function(labelText) {
	$('<label>').css({"line-height":"2em", "padding":"0.5em"}).text(labelText).appendTo(this.$element);
    };
    OO.ui.ActionFieldLayout.prototype.moveLabelToInline = function() {
	this.$label.css({"line-height":"2em", "padding":"0.5em"}).appendTo(this.$element.find(".oo-ui-actionFieldLayout-input"));
    };
    $( function($) {

	/* == Basic settings and checks == */
	/* ******************************* */

	/* --- Quick checks that script should be running (then it's safe to define vars and function) --- */
	//Check 1: Page is not in edit/history/diff/oldid mode
	var thispageurl = window.location.href;
	if ( thispageurl.indexOf("?") !== -1 ) {
	    console.log("[RPPHelper] Page is in edit, history, diff, or oldid mode");
	    return;
	}
	//Check 2: User is Sysop
	if ( -1 === $.inArray('sysop', mw.config.get('wgUserGroups')) ) {
	    console.log("[RPPHelper] User is not a sysop");
	    return;
	}
	//Check 3: Page is an RPP page
	var thispage = mw.config.get( 'wgPageName' );
	if ( thispage.indexOf("Wikipedia:Requests_for_page_protection") === -1 ) {
	    console.log("[RPPHelper] Current page is not 'Wikipedia:Requests for page protection'");
	    return;
	}
	//Global vars and helper functions stored in RPPH object
	RPPH = {};
	RPPH.Api = new mw.Api();
	RPPH.revid = mw.config.get('wgRevisionId'); //For comparison later
	RPPH.getPageText = function(p) {
	    var t = mw.Title.newFromText( decodeURIComponent(p) );
	    if (t) {
		return t.getPrefixedText();
	    } else {
		//FORLATER: is this needed and/or the best way to handle a null t?...
		//      t should only be null if p is a bad page title...
		return p.replace(/_/g, " ");
	    }
	};
	RPPH.protectionDescriptions = {
	    "review": "Require pending changes reviewer",
	    "reviewer": "Require pending changes reviewer",
	    "autoconfirmed": "Require autoconfirmed or confirmed access",
	    "extendedconfirmed": "Require extended confirmed access",
	    "templateeditor": "Require template editor access",
	    "sysop": "Require administrator access"
	};


	/* == Set up inline links and set data for each discussion == */
	/* ********************************************************** */
	//Fix for WP:RPP#Current_requests_for_edits_to_a_protected_page
	$("#Current_requests_for_edits_to_a_protected_page").parent().nextAll("h3").children().addClass("RPPHelper-ignore");

	$("h3 > span.mw-headline").not(".RPPHelper-ignore").each(function( headings_index ) {
	    var $this = $(this);
	    // fix for "Auto-number headings" preference
	    $(".mw-headline-number", this).prependTo($this.parent());

	    var section_header = $this.wrapInner("<span></span>").text();


	    var sectionlink = $this.next().find("a").not(".mw-editsection-visualeditor, .autoCloserButton").attr('href');
	    var editsection = sectionlink.split("section=")[1];

	    var pages=[];

	    var $pages = $this.parent().nextUntil("h3, h2")
		.find("li").has("span.plainlinks.lx")
		.children("span").filter(":first-child")
		.children("a").filter(":first-child");
	    $pages.each(function( ii ) {
		pages[ii] = { "pageTitle": RPPH.getPageText($(this).text()) };
	    });

	    // sanity check - is title non-null?
	    if (pages[0] === null ) {
		console.log("[RPPH] Could not find page title for section ", editsection);
		return;
	    }
	    // For the moment, ignore multi-page requests
	    if (pages.length > 1 ) {
		var concated_pages = pages.join(" | ");
		console.log("[RPPH] Section ", editsection, " is a multi-page request: ", concated_pages );
		return;
	    }

	    // Add link after heading
	    $(this).append("<span id=RPPH_respond_" + headings_index + " class='RPPH_processing' style='font-size:85%;'>" +
			   "<span style='margin-left:1em;'>[<a style='cursor:pointer;' title='Respond...' class='RPPH-respond-link'>Respond</a>]</span>" +
			   "</span>");

	    // Store request data
	    var req_data = {
		"section_header": section_header,
		"editsection": editsection,
		"respond_span_id": "RPPH_respond_" + headings_index,
		"page_data": pages
	    };
	    $("#RPPH_respond_" + headings_index).data("req_data", req_data);


	}); //end of .each()

	$('.RPPH-respond-link').click(function(){
	    var $grandparent = $(this).parent().parent();
	    $grandparent.children().hide().last().after("<span id='RPPH-doing'> ...</span>");
	    makeRpphInterface($grandparent.data("req_data"));
	});
	/* -- Show/hide closed discussions -- */
	/*
	  $(document).ready( function () {
	  $( document.body ).append('<div id="RPPHelper-showhide">'+
	  '<a id="RPPHelper-showhide-hide">Hide answered requests</a>'+
	  '<a id="RPPHelper-showhide-show">Show answered requests</a>'+
	  '</div>');
	  $("#RPPHelper-showhide").css({
	  "bottom": "0",
	  "display": "block",
	  "position": "fixed",
	  "right": "0",
	  "z-index": "100",
	  "padding": "5px",
	  "box-shadow": "0 2px 4px rgba(0,0,0,0.5)",
	  "background-color": "#FEF9E6",
	  "border": "1px solid #aaa",
	  "border-radius": "5px",
	  "font-size": "85%"
	  });
	  $('#RPPHelper-showhide-show').hide();
	  $('#RPPHelper-showhide-hide').on('click', function() {
	  $(".rpph-answered").hide();
	  $('#RPPHelper-showhide-show').show();
	  $('#RPPHelper-showhide-hide').hide();
	  });
	  $('#RPPHelper-showhide-show').on('click', function() {
	  $(".rpph-answered").show();
	  $('#RPPHelper-showhide-show').hide();
	  $('#RPPHelper-showhide-hide').show();
	  });
	  } );
	*/

	/* == Get current protection level == */
	// Derived from Twinkle: https://en.wikipedia.org/wiki/MediaWiki:Gadget-twinkleprotect.js
	/* ********************************************************* */

	var fetchProtectionLevel = function(pagetitle) {
	    var index = RPPH.index;
	    RPPH[index].currentProtectionLevels = {};

	    var protectDeferred = RPPH.Api.get({
		format: 'json',
		indexpageids: true,
		action: 'query',
		list: 'logevents',
		letype: 'protect',
		letitle: pagetitle,
		prop: 'info|flagged',
		inprop: 'protection',
		titles: pagetitle
	    });
	    var stableDeferred = RPPH.Api.get({
		format: 'json',
		action: 'query',
		list: 'logevents',
		letype: 'stable',
		letitle: pagetitle
	    });

	    $.when.apply($, [protectDeferred, stableDeferred])
		.done(function(protectData, stableData){
		    var index = RPPH.index;

		    var pageid = protectData[0].query.pageids[0];
		    var page = protectData[0].query.pages[pageid];
		    var current = {};

		    RPPH[index].req_data.pageid = pageid; //Allow access within getActionProcess
		    RPPH[index].req_data.page = page; //Allow access within getActionProcess

		    $.each(page.protection, function( _i, protection ) {
			if (protection.type !== "aft") {
			    current[protection.type] = {
				level: protection.level,
				expiry: protection.expiry,
				cascade: protection.cascade === ''
			    };
			}
		    });

		    if (page.flagged) {
			current.stabilize = {
			    level: page.flagged.protection_level,
			    expiry: page.flagged.protection_expiry
			};
		    }

		    // store the protection level and log info
		    var hasProtectLog = !!protectData[0].query.logevents.length;
		    var hasStableLog = !!stableData[0].query.logevents.length;
		    var currentlyProtected = !$.isEmptyObject(current);

		    // build up and deliver messages of current and previous protections
		    var $msg = $('<div>');
		    // defaults if not currently or previously protected
		    var label = "Not currently or previously protected";
		    var icon = "unLock";
		    if ( hasProtectLog || hasStableLog ) {
			// currently or previously protected
			var logs_separator = " • ";
			var msg_start = "(";
			var msg_end = ")";
			if ( currentlyProtected ) {
			    label = 'Currently protected';
			    icon = 'lock';
			} else {
			    label = 'Previously protected';
			    icon = 'history';
			    logs_separator = " and ";
			    msg_start = "See ";
			    msg_end = " for details.";
			}
			$($msg).append(msg_start);
			if ( hasProtectLog ) {
			    $('<a>')
				.attr( {
				    target: "_blank",
				    href: mw.util.getUrl('Special:Log', {action: 'view', page: page.title, type: 'protect'})
				} )
				.text('protection log')
				.appendTo($msg);
			    if ( hasStableLog ) {
				$('<span>').text(logs_separator).appendTo($msg);
			    }
			}
			if ( hasStableLog ) {
			    $('<a>')
				.attr( {
				    target: "_blank",
				    href: mw.util.getUrl('Special:Log', {action: 'view', page: page.title, type: 'stable'})
				} )
				.text('pending changes log')
				.appendTo($msg);
			}
			$($msg).append(msg_end);
		    }
		    if (currentlyProtected) {
			var $currentLevels = $('<dl>');
			$.each(current, function(type, settings) {
			    var prot_label, prot_settings, prot_expires = "";
			    if ( type === 'stabilize' ) {
				prot_label = 'Pending Changes';
				prot_settings = RPPH.protectionDescriptions[settings.level] || settings.level;
				prot_settings = 'Auto-accept: ' + prot_settings.toLowerCase();
			    } else {
				prot_label = type.slice(0,1).toUpperCase() + type.slice(1);
				prot_settings = RPPH.protectionDescriptions[settings.level] || settings.level;
			    }
			    if (settings.expiry === 'infinity') {
				prot_expires =  "indefinite";
			    } else {
				prot_expires = "expires " + new Date(settings.expiry).toUTCString().replace("GMT", "UTC");
			    }
			    if (settings.cascade) {
				prot_settings += " (cascading, " + prot_expires + ")";
			    } else {
				prot_settings += " (" + prot_expires + ")";
			    }

			    $('<dt>').text(prot_label).appendTo($currentLevels);
			    $('<dd>').text(prot_settings).appendTo($currentLevels);
			} );
			$currentLevels.prependTo($msg);
		    }
		    RPPH[index].deferred.existingProtection.resolve(label, icon, $msg);
		    RPPH[index].currentProtectionLevels = current; //Store for later
		})
		.fail(function(){
		    RPPH[RPPH.index].deferred.existingProtection.reject();
		});
	};


	/* == Interface is built out of oojs-ui widgets == */
	/* ********************************************************* */

	var initiateInterfaceElements = function(req_data) {
	    //store globally
	    var index = req_data.respond_span_id;
	    RPPH.index = index;
	    RPPH[index] = {
		widgets: {},
		layouts: {},
		overlayDiv: $("<div>"),
		deferred: {}
	    };
	    RPPH[index].req_data = req_data; //Allow access within getActionProcess

	    //--- Current/previous protections ---
	    RPPH[index].widgets.existingProtectionPopbutton = new OO.ui.PopupButtonWidget( {
		title: 'Fetching current protection...',
		icon: 'ellipsis',
		framed: true,
		disabled: true,
		popup: {
		    $content: $('<p>').addClass('popcontent'),
		    $overlay: RPPH[index].overlayDiv,
		    padded: true,
		    align: 'force-left'
		}
	    } );
	    RPPH[index].deferred.existingProtection = $.Deferred();
	    RPPH[index].deferred.existingProtection
		.done( function(btnTitle, btnIcon, $popContent) {
		    $('<p>').css("font-size", "110%").text(btnTitle).prependTo($popContent);
		    RPPH[index].widgets.existingProtectionPopbutton
			.setTitle(btnTitle)
			.setIcon(btnIcon)
			.setDisabled(false)
			.getPopup().$element.find('.popcontent').append($popContent);
		} )
		.fail( function(failReason) {
		    RPPH[index].widgets.existingProtectionPopbutton
			.setLabel('Failed to load current protection')
			.setIcon('alert');
		    if ( failReason !== null ) {
			RPPH[index].widgets.existingProtectionPopbutton
			    .setDisabled(false)
			    .getPopup().$element.find('.popcontent').text(failReason);
		    }
		} );
	    fetchProtectionLevel(req_data.page_data[0].pageTitle);

	    //--- Response dropdown ---
	    RPPH[index].widgets.responseDropdownOptions = [
		new OO.ui.MenuOptionWidget( { data: { filter: "accept",  'para1': "semi", 'para2_label': "Duration" }, label: "Semi-protected" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "accept",  'para1': "pend", 'para2_label': "Duration" }, label: "Pending-changes protected" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "accept",  'para1': "excp", 'para2_label': "Duration" }, label: "Extended confirmed protected" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "accept",  'para1': "full", 'para2_label': "Duration" }, label: "Fully protected" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "accept",  'para1': "move", 'para2_label': "Duration" }, label: "Move protected" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "accept",  'para1': "salt", level:"extendedconfirmed", 'para2_label': "Duration" }, label: "Creation protected (extended confirmed)" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "accept",  'para1': "salt", level:"sysop", 'para2_label': "Duration" }, label: "Creation protected (full)" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "accept",  'para1': "temp", 'para2_label': "Duration" }, label: "Template protected" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "deny", 'para4_label': "Reporting user" }, label: "Declined" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "nact", 'para4_label': "Reporting user" }, label: "Declined – Not enough recent disruptive activity" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "raiv", 'para4_label': "Reporting user" }, label: "Declined – Warn user and report to [[WP:AIV|AIV]] if they continue" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "npre", 'para4_label': "Reporting user" }, label: "Declined – Pages are not protected preemptively" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "nhrt", 'para4_label': "Reporting user" }, label: "Declined – Not a high-risk template" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "disp", 'para4_label': "Reporting user" }, label: "Declined – Content dispute, consider dispute resolution" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "usta", 'para4_label': "Reporting user" }, label: "Declined – User talk pages are not typically protected" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "rate", 'para4_label': "Reporting user" }, label: "Declined – Edit rate too high for pending changes" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "coll", 'para4_label': "Reporting user" }, label: "Declined – Likely collateral damage" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "cpif", 'para4_label': "Reporting user" }, label: "Declined – No changes required at this point in time" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "bloc", 'para2_label': "Blocked user", 'para3_label': "Blocking admin", 'para4_label': "Reporting user" }, label: "User(s) blocked" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "tabl", 'para2_label': "Blocking admin", 'para4_label': "Reporting user" }, label: "User(s) re-blocked, talk page editing disallowed" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "other",   'para1': "ispr", 'para2_label': "Admin" }, label: "Already protected" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "accept",  'para1': "unpr" }, label: "Unprotected" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "noun", 'para4_label': "Reporting user" }, label: "Not unprotected" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "nucr", 'para4_label': "Reporting user" }, label: "Not unprotected – create sourced version in userspace" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "edre", 'para4_label': "Reporting user" }, label: "Not unprotected – use edit request for specific changes" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "other",   'para1': "isun", 'para2_label': "Admin" }, label: "Already unprotected" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "other",   'para1': "chck" }, label: "Checking" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "other",   'para1': "ques" }, label: "Question" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "other",   'para1': "note" }, label: "Note" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "other",   'para1': "arch" }, label: "Request immediate archiving" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "other",   'para1': "withdrawn" }, label: "Withdrawn by requestor" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "an3", 'para4_label': "Reporting user" }, label: "Consider the edit warring noticeboard" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "accept",  'para1': "done" }, label: "Done" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "other",   'para1': "isdo", 'para2_label': "Admin" }, label: "Already done" } ),
		new OO.ui.MenuOptionWidget( { data: { filter: "decline", 'para1': "notd", 'para4_label': "Reporting user" }, label: "Not done" } )
	    ];
	    RPPH[index].widgets.responseDropdown = new OO.ui.DropdownWidget( {
		$overlay: RPPH[index].overlayDiv,
		label: 'Select response',
		menu: {
		    items: RPPH[index].widgets.responseDropdownOptions
		}
	    } );

	    //--- Filters for response dropdown ---
	    RPPH[index].widgets.filterAllOption = new OO.ui.RadioOptionWidget( {
		data: '',
		label: 'All',
		classes: ['rpph-inline', 'rpph-rightMargin']
	    } );
	    RPPH[index].widgets.filterAcceptOption = new OO.ui.RadioOptionWidget( {
		data: 'accept',
		label: 'Accept',
		classes: ['rpph-inline', 'rpph-rightMargin']
	    } );
	    RPPH[index].widgets.filterDeclineOption = new OO.ui.RadioOptionWidget( {
		data: 'decline',
		label: 'Decline',
		classes: ['rpph-inline', 'rpph-rightMargin']
	    } );
	    RPPH[index].widgets.filterOtherOption = new OO.ui.RadioOptionWidget( {
		data: 'other',
		label: 'Other',
		classes: ['rpph-inline']
	    } );
	    RPPH[index].widgets.filtersRadioSelect = new OO.ui.RadioSelectWidget( {
		items: [RPPH[index].widgets.filterAllOption, RPPH[index].widgets.filterAcceptOption, RPPH[index].widgets.filterDeclineOption, RPPH[index].widgets.filterOtherOption]
	    } );
	    // Styling
	    RPPH[index].widgets.filtersRadioSelect.$element.find(".rpph-inline").css("display","inline");
	    RPPH[index].widgets.filtersRadioSelect.$element.find(".rpph-rightMargin").css("margin-right","2em");
	    // Default to All
	    RPPH[index].widgets.filtersRadioSelect.selectItem(RPPH[index].widgets.filterAllOption);
	    // Do the filtering when changed
	    RPPH[index].widgets.filtersRadioSelect.on('choose', function(selectedItem) {
		var filter = selectedItem.getData();
		for ( var i=0; i<RPPH[index].widgets.responseDropdownOptions.length; i++ ) {
		    if ( filter === '' || filter === RPPH[index].widgets.responseDropdownOptions[i].getData().filter ) {
			//Show option
			RPPH[index].widgets.responseDropdownOptions[i].show();
		    } else {
			//Hide option
			RPPH[index].widgets.responseDropdownOptions[i].hide();
		    }
		}
		if ( RPPH[index].widgets.responseDropdown.getMenu().findSelectedItem() && !RPPH[index].widgets.responseDropdown.getMenu().findSelectedItem().isVisible() ) {
		    //If current selection no longer visible, clear the selection
		    RPPH[index].widgets.responseDropdown.getMenu().selectItem();
		}
	    } );

	    //--- Additional comments ---
	    RPPH[index].widgets.additionalTextInput = new OO.ui.TextInputWidget();

	    //--- Para2 and Para3 inputs ---
	    //Basic text inputs
	    RPPH[index].widgets.para2TextInput = new OO.ui.TextInputWidget();
	    RPPH[index].widgets.para3TextInput = new OO.ui.TextInputWidget();
	    RPPH[index].widgets.para4TextInput = new OO.ui.TextInputWidget();

	    //--- Protection settings inputs ---
	    //Duration quantity input
	    RPPH[index].widgets.durationNumInput = new OO.ui.TextInputWidget( {
		type: 'number',
		inputFilter: function(value) {
		    return value.replace(/\D/g, "");
		}
	    } );
	    RPPH[index].widgets.durationNumInput.$element.css("width","4em");
	    //Duration units button selection
	    RPPH[index].widgets.hourOption = new OO.ui.ButtonOptionWidget( {
		data: 'hours',
		label: 'hours'
	    } );
	    RPPH[index].widgets.dayOption = new OO.ui.ButtonOptionWidget( {
		data: 'days',
		label: 'days'
	    } );
	    RPPH[index].widgets.weekOption = new OO.ui.ButtonOptionWidget( {
		data: 'weeks',
		label: 'weeks'
	    } );
	    RPPH[index].widgets.monthOption = new OO.ui.ButtonOptionWidget( {
		data: 'months',
		label: 'months'
	    } );
	    RPPH[index].widgets.yearOption = new OO.ui.ButtonOptionWidget( {
		data: 'years',
		label: 'years'
	    } );
	    RPPH[index].widgets.indefOption = new OO.ui.ButtonOptionWidget( {
		data: 'indefinite',
		label: 'indefinite'
	    } );
	    //Small gap between indef and other options
	    RPPH[index].widgets.indefOption.$element.css("margin-left", "1em");
	    RPPH[index].widgets.unitsButtonSelect = new OO.ui.ButtonSelectWidget( {
		items: [ RPPH[index].widgets.hourOption, RPPH[index].widgets.dayOption, RPPH[index].widgets.weekOption, RPPH[index].widgets.monthOption, RPPH[index].widgets.yearOption, RPPH[index].widgets.indefOption ]
	    } );
	    // Default to weeks
	    RPPH[index].widgets.unitsButtonSelect.selectItem(RPPH[index].widgets.weekOption);
	    //No quantity when indef is selected
	    RPPH[index].widgets.unitsButtonSelect.on('choose', function(item) {
		if ( item.getData() === 'indefinite' ) {
		    RPPH[index].widgets.durationNumInput.setDisabled(true);
		} else {
		    RPPH[index].widgets.durationNumInput.setDisabled(false);
		}
	    });
	    //Switch labels/data to singular/plural when duration quantity changes to/from 1
	    RPPH[index].optionsPlural = true;
	    RPPH[index].widgets.durationNumInput.on('change', function() {
		if ( RPPH[index].widgets.durationNumInput.getValue() !== "1" && !RPPH[index].optionsPlural ) {
		    RPPH[index].widgets.hourOption.setPluralLabel();
		    RPPH[index].widgets.hourOption.setPluralData();
		    RPPH[index].widgets.dayOption.setPluralLabel();
		    RPPH[index].widgets.dayOption.setPluralData();
		    RPPH[index].widgets.weekOption.setPluralLabel();
		    RPPH[index].widgets.weekOption.setPluralData();
		    RPPH[index].widgets.monthOption.setPluralLabel();
		    RPPH[index].widgets.monthOption.setPluralData();
		    RPPH[index].widgets.yearOption.setPluralData();
		    RPPH[index].widgets.yearOption.setPluralLabel();
		    RPPH[index].optionsPlural = true;
		} else if ( RPPH[index].widgets.durationNumInput.getValue() === "1" && RPPH[index].optionsPlural ) {
		    RPPH[index].widgets.hourOption.setSingularLabel();
		    RPPH[index].widgets.hourOption.setSingularData();
		    RPPH[index].widgets.dayOption.setSingularLabel();
		    RPPH[index].widgets.dayOption.setSingularData();
		    RPPH[index].widgets.weekOption.setSingularLabel();
		    RPPH[index].widgets.weekOption.setSingularData();
		    RPPH[index].widgets.monthOption.setSingularLabel();
		    RPPH[index].widgets.monthOption.setSingularData();
		    RPPH[index].widgets.yearOption.setSingularLabel();
		    RPPH[index].widgets.yearOption.setSingularData();
		    RPPH[index].optionsPlural = false;
		}
	    } );
	    //Preset-reason dropdowns
	    var presetReasonOptions = {
		edit: [
		    new OO.ui.MenuOptionWidget( {data: {pp: "vandalism", wikitext: "Persistent [[WP:Vandalism|vandalism]]"}, label: "Persistent vandalism"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "protected", wikitext: "Persistent [[WP:Disruptive editing|disruptive editing]]"}, label: "Persistent disruptive editing"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "protected", wikitext: "Addition of [[WP:Verifiability|unsourced or poorly sourced content]]"}, label: "Addition of unsourced or poorly sourced content"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "blp", wikitext: "Violations of the [[WP:BLP|biographies of living persons policy]]"}, label: "Violations of the biographies of living persons policy"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "sock", wikitext: "Persistent [[WP:Sock puppetry|sock puppetry]]"}, label: "Persistent sock puppetry"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "sock", wikitext: "Persistent [[WP:Block#Evasion of blocks|block evasion]]"}, label: "Persistent block evasion"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "vandalism", wikitext: "Persistent [[WP:Spam|spamming]]"}, label: "Persistent spamming"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "30-500", wikitext: "[[WP:Arbitration Committee/Procedures#Enforcement|Arbitration enforcement]]"}, label: "Arbitration enforcement"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "30-500", wikitext: "[[WP:30/500|Arbitration enforcement]]: New editors are prohibited from editing [[Wikipedia:Arbitration/Index/Palestine-Israel articles|pages related to the Arab-Israeli conflict]]"}, label: "Arbitration enforcement under ARBPIA3"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "30-500", wikitext: "Persistent [[WP:Vandalism|vandalism]] from (auto)confirmed accounts"}, label: "Persistent vandalism from (auto)confirmed accounts"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "30-500", wikitext: "Persistent [[WP:Disruptive editing|disruptive editing]] from (auto)confirmed accounts"}, label: "Persistent disruptive editing from (auto)confirmed accounts"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "30-500", wikitext: "Persistent [[WP:Sock puppetry|sock puppetry]] from (auto)confirmed accounts"}, label: "Persistent sock puppetry from (auto)confirmed accounts"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "30-500", wikitext: "Persistent violations of the [[WP:BLP|biographies of living persons policy]] from (auto)confirmed accounts"}, label: "Persistent violations of BLP policy from (auto)confirmed accounts"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "dispute", wikitext: "[[WP:PP#Content disputes|Edit warring / content dispute]]"}, label: "Edit warring / content dispute"} ),
		    //new OO.ui.MenuOptionWidget( {data: {pp: "usertalk", wikitext: "[[WP:PP#Blocked users|Inappropriate use of user talk page while blocked]]"}, label: "Inappropriate use of user talk page while blocked"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "protected", wikitext: "[[WP:PP#User pages|User request within own user space]]"}, label: "User request within own user space"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "template", wikitext: "[[WP:High-risk templates|Highly visible template]]"}, label: "Highly visible template"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "template", wikitext: "[[WP:High-risk templates|High-risk Lua module]]"}, label: "High-risk Lua module"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "protected", wikitext: ""}, label: "Custom..."} )
		],
		move: [
		    new OO.ui.MenuOptionWidget( {data: {pp: "move", wikitext: "[[WP:MOVP|Page-move vandalism]]"}, label: "Page-move vandalism"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "move", wikitext: "[[WP:MOVP|Move warring]]"}, label: "Move warring"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "move", wikitext: "[[WP:MOVP|Highly visible page]]"}, label: "Highly visible page"} ),
		    new OO.ui.MenuOptionWidget( {data: {pp: "move", wikitext: ""}, label: "Custom..."} )
		],
		create: [
		    new OO.ui.MenuOptionWidget( {data: {wikitext: "[[WP:SALT|Offensive name]]"}, label: "Offensive name"} ),
		    new OO.ui.MenuOptionWidget( {data: {wikitext: "[[WP:SALT|Repeatedly recreated]]"}, label: "Repeatedly recreated"} ),
		    new OO.ui.MenuOptionWidget( {data: {wikitext: "[[WP:BLPDEL|Recently deleted BLP]]"}, label: "Recently deleted BLP"} ),
		    new OO.ui.MenuOptionWidget( {data: {wikitext: "[[WP:SALT|Repeatedly recreated]] [[WP:CSD#A7|A7]] article"}, label: "Repeatedly recreated CSD:A7 article − non-notable person, organisation, etc."} ),
		    //new OO.ui.MenuOptionWidget( {data: {wikitext: "[[Wikipedia:File names#Generic file names|Generic file name]]"}, label: "Generic file name"} ),
		    new OO.ui.MenuOptionWidget( {data: {wikitext: ""}, label: "Custom..."} )
		]
	    };
	    RPPH[index].widgets.presetReasonDropDown_edit = new OO.ui.DropdownWidget( {
		$overlay: RPPH[index].overlayDiv,
		label: 'Select an option',
		menu: { items: presetReasonOptions.edit }
	    } );
	    RPPH[index].widgets.presetReasonDropDown_move = new OO.ui.DropdownWidget( {
		$overlay: RPPH[index].overlayDiv,
		label: 'Select an option',
		menu: { items: presetReasonOptions.move }
	    } );
	    RPPH[index].widgets.presetReasonDropDown_move.hide();
	    RPPH[index].widgets.presetReasonDropDown_create = new OO.ui.DropdownWidget( {
		$overlay: RPPH[index].overlayDiv,
		label: 'Select an option',
		menu: { items: presetReasonOptions.create }
	    } );
	    RPPH[index].widgets.presetReasonDropDown_create.hide();
	    //Additional/custom reason
	    RPPH[index].widgets.additionalReasonTextInput = new OO.ui.TextInputWidget( {
		label: 'Additional comments (optional)'
	    } );
	    //Adjust placeholder text when Custom... is selected
	    RPPH[index].widgets.presetReasonDropDown_edit.on('labelChange', function(){
		if ( RPPH[index].widgets.presetReasonDropDown_edit.getMenu().findSelectedItem().getData().wikitext === "" ) {
		    RPPH[index].widgets.additionalReasonTextInput.setLabel('Custom reason');
		} else {
		    RPPH[index].widgets.additionalReasonTextInput.setLabel('Additional (optional)');
		}
	    } );
	    RPPH[index].widgets.presetReasonDropDown_move.on('labelChange', function(){
		if ( RPPH[index].widgets.presetReasonDropDown_move.getMenu().findSelectedItem().getData().wikitext === "" ) {
		    RPPH[index].widgets.additionalReasonTextInput.setLabel('Custom reason');
		} else {
		    RPPH[index].widgets.additionalReasonTextInput.setLabel('Additional (optional)');
		}
	    } );
	    RPPH[index].widgets.presetReasonDropDown_create.on('labelChange', function(){
		if ( RPPH[index].widgets.presetReasonDropDown_create.getMenu().findSelectedItem().getData().wikitext === "" ) {
		    RPPH[index].widgets.additionalReasonTextInput.setLabel('Custom reason');
		} else {
		    RPPH[index].widgets.additionalReasonTextInput.setLabel('Additional (optional)');
		}
	    } );
	    //When one of these dropdowns is shown, hide the other two
	    RPPH[index].widgets.presetReasonDropDown_edit.on('toggle', function(isVisible) {
		if ( isVisible ) {
		    RPPH[index].widgets.presetReasonDropDown_move.hide();
		    RPPH[index].widgets.presetReasonDropDown_create.hide();
		}
	    } );
	    RPPH[index].widgets.presetReasonDropDown_move.on('toggle', function(isVisible) {
		if ( isVisible ) {
		    RPPH[index].widgets.presetReasonDropDown_edit.hide();
		    RPPH[index].widgets.presetReasonDropDown_create.hide();
		}
	    } );
	    RPPH[index].widgets.presetReasonDropDown_create.on('toggle', function(isVisible) {
		if ( isVisible ) {
		    RPPH[index].widgets.presetReasonDropDown_edit.hide();
		    RPPH[index].widgets.presetReasonDropDown_move.hide();
		}
	    } );
	    //Tagging options
	    RPPH[index].widgets.tagToggleSwitch = new OO.ui.ToggleSwitchWidget( {
		value: true
	    } );
	    RPPH[index].widgets.tagOption_icon = new OO.ui.CheckboxMultioptionWidget( { selected: true, label: 'Iconify (small=yes)', classes: ["rpph-inline-marginLeft"] } );
	    RPPH[index].widgets.tagOption_noinclude = new OO.ui.CheckboxMultioptionWidget( { label: 'Noinclude (will not be transcluded)', classes: ["rpph-inline-marginLeft"] } );
	    RPPH[index].widgets.tagOptionMultiselect = new OO.ui.CheckboxMultiselectWidget( {
		items: [ RPPH[index].widgets.tagOption_icon, RPPH[index].widgets.tagOption_noinclude ]
	    } );
	    // style
	    RPPH[index].widgets.tagOptionMultiselect.$element.find(".rpph-inline-marginLeft").css({"display": "inline", "margin-left": "2em"});
	    //disable options when tagging switched off
	    RPPH[index].widgets.tagToggleSwitch.on('change', function(switch_state) {
		RPPH[index].widgets.tagOptionMultiselect.setDisabled( !switch_state );
	    } );

	    //--- Custom protection setting modifications (for "Done" response) ---
	    //Protection level dropdowns
	    var protectionLevelOptions_edit = [
		new OO.ui.MenuOptionWidget( { data: "all", label: "Allow all" } ),
		new OO.ui.MenuOptionWidget( { data: "autoconfirmed", label: "Require autoconfirmed or confirmed access" } ),
		new OO.ui.MenuOptionWidget( { data: "extendedconfirmed", label: "Require extended confirmed access" } ),
		new OO.ui.MenuOptionWidget( { data: "templateeditor", label: "Require template editor access" } ),
		new OO.ui.MenuOptionWidget( { data: "sysop", label: "Require administrator access" } )
	    ];
	    var protectionLevelOptions_move = [
		new OO.ui.MenuOptionWidget( { data: "all", label: "Allow all" } ),
		new OO.ui.MenuOptionWidget( { data: "extendedconfirmed", label: "Require extended confirmed access" } ),
		new OO.ui.MenuOptionWidget( { data: "templateeditor", label: "Require template editor access" } ),
		new OO.ui.MenuOptionWidget( { data: "sysop", label: "Require administrator access" } )
	    ];
	    var protectionLevelOptions_pc = [
		new OO.ui.MenuOptionWidget( { data: "none", label: "None (accept revisions from all users)" } ),
		new OO.ui.MenuOptionWidget( { data: "autoconfirmed", label: "Review revisions from new and unregistered users" } )
	    ];
	    var protectionLevelOptions_create = [
		new OO.ui.MenuOptionWidget( { data: "all", label: "Allow all" } ),
		new OO.ui.MenuOptionWidget( { data: "extendedconfirmed", label: "Require extended confirmed access" } ),
		new OO.ui.MenuOptionWidget( { data: "templateeditor", label: "Require template editor access" } ),
		new OO.ui.MenuOptionWidget( { data: "sysop", label: "Require administrator access" } )
	    ];
	    RPPH[index].widgets.protectionLevelDropDown_edit = new OO.ui.DropdownWidget( {
		$overlay: RPPH[index].overlayDiv,
		classes: ['rpph-dropdown-minwidth'],
		disabled: true,
		menu: { items: protectionLevelOptions_edit }
	    } );
	    RPPH[index].widgets.protectionLevelDropDown_edit.getMenu().selectItemByData("all");
	    RPPH[index].widgets.protectionLevelDropDown_move = new OO.ui.DropdownWidget( {
		$overlay: RPPH[index].overlayDiv,
		classes: ['rpph-dropdown-minwidth'],
		disabled: true,
		menu: { items: protectionLevelOptions_move }
	    } );
	    RPPH[index].widgets.protectionLevelDropDown_move.getMenu().selectItemByData("all");
	    RPPH[index].widgets.protectionLevelDropDown_pc = new OO.ui.DropdownWidget( {
		$overlay: RPPH[index].overlayDiv,
		classes: ['rpph-dropdown-minwidth'],
		disabled: true,
		menu: { items: protectionLevelOptions_pc }
	    } );
	    RPPH[index].widgets.protectionLevelDropDown_pc.getMenu().selectItemByData("none");
	    RPPH[index].widgets.protectionLevelDropDown_create = new OO.ui.DropdownWidget( {
		$overlay: RPPH[index].overlayDiv,
		classes: ['rpph-dropdown-minwidth'],
		disabled: true,
		menu: { items: protectionLevelOptions_create }
	    } );
	    RPPH[index].widgets.protectionLevelDropDown_create.getMenu().selectItemByData("all");
	    //Switchs (to modify/don't modify settings)
	    RPPH[index].widgets.customProtectionToggleSwitch_edit =	new OO.ui.ToggleSwitchWidget();
	    RPPH[index].widgets.customProtectionToggleSwitch_move =	new OO.ui.ToggleSwitchWidget();
	    RPPH[index].widgets.customProtectionToggleSwitch_pc = new OO.ui.ToggleSwitchWidget();
	    RPPH[index].widgets.customProtectionToggleSwitch_create = new OO.ui.ToggleSwitchWidget();
	    //hide protection settings if all are off
	    RPPH[index].customProtectionShowHideSettings = function() {
		if ( !RPPH[index].widgets.customProtectionToggleSwitch_edit.value &&
		     !RPPH[index].widgets.customProtectionToggleSwitch_move.value &&
		     !RPPH[index].widgets.customProtectionToggleSwitch_pc.value &&
		     !RPPH[index].widgets.customProtectionToggleSwitch_create.value ) {
		    RPPH[index].layouts.protectionSettingsFieldset.hide();
		} else {
		    RPPH[index].layouts.protectionSettingsFieldset.show();
		    if (RPPH[index].widgets.customProtectionToggleSwitch_create.value) {
			RPPH[index].layouts.tagToggleLayout.hide();
			RPPH[index].layouts.tagOptionsLayout.hide();
		    } else {
			RPPH[index].layouts.tagToggleLayout.show();
			RPPH[index].layouts.tagOptionsLayout.show();
		    }
		}
	    };
	    //enable/disable dropdowns based on toggle switches
	    RPPH[index].widgets.customProtectionToggleSwitch_edit.on('change', function(toggleIsOn) {
		RPPH[index].widgets.protectionLevelDropDown_edit.setDisabled(!toggleIsOn);
		RPPH[index].customProtectionShowHideSettings();
	    } );
	    RPPH[index].widgets.customProtectionToggleSwitch_move.on('change', function(toggleIsOn) {
		RPPH[index].widgets.protectionLevelDropDown_move.setDisabled(!toggleIsOn);
		RPPH[index].customProtectionShowHideSettings();
	    } );
	    RPPH[index].widgets.customProtectionToggleSwitch_pc.on('change', function(toggleIsOn) {
		RPPH[index].widgets.protectionLevelDropDown_pc.setDisabled(!toggleIsOn);
		RPPH[index].customProtectionShowHideSettings();
	    } );
	    RPPH[index].widgets.customProtectionToggleSwitch_create.on('change', function(toggleIsOn) {
		RPPH[index].widgets.protectionLevelDropDown_create.setDisabled(!toggleIsOn);
		RPPH[index].customProtectionShowHideSettings();
	    } );
	    //Enable toggles when dropdowns are clicked


	    //--- Fieldsets and layouts ---
	    //Page and current protection
	    RPPH[index].layouts.infoFieldset = new OO.ui.FieldsetLayout( {
		label: req_data.page_data[0].pageTitle
	    } );
	    RPPH[index].layouts.infoFieldset.$label.before( RPPH[index].widgets.existingProtectionPopbutton.$element );
	    //Response
	    RPPH[index].layouts.responseFieldset = new OO.ui.FieldsetLayout( {
		label: "Response",
		classes: ["container"]
	    } );
	    RPPH[index].layouts.responseLayouts = [
		new OO.ui.HorizontalLayout( {
		    items: [RPPH[index].widgets.responseDropdown, RPPH[index].widgets.filtersRadioSelect]
		} ),
		new OO.ui.FieldLayout(RPPH[index].widgets.additionalTextInput, {
		    label: 'Additional response comments (optional)',
		    align: 'top'
		} )
	    ];
	    RPPH[index].layouts.responseFieldset.addItems( RPPH[index].layouts.responseLayouts );
	    //Para2
	    RPPH[index].layouts.para2Fieldset = new OO.ui.FieldsetLayout( {
		classes: ["container"]
	    } );
	    RPPH[index].layouts.para2Layout = new OO.ui.FieldLayout( RPPH[index].widgets.para2TextInput );
	    RPPH[index].layouts.para2Fieldset.addItems( [ RPPH[index].layouts.para2Layout ] );
	    //Para3
	    RPPH[index].layouts.para3Fieldset = new OO.ui.FieldsetLayout( {
		classes: ["container"]
	    } );
	    RPPH[index].layouts.para3Layout = new OO.ui.FieldLayout( RPPH[index].widgets.para3TextInput );
	    RPPH[index].layouts.para3Fieldset.addItems( [ RPPH[index].layouts.para3Layout ] );
	    //Para4
	    RPPH[index].layouts.para4Fieldset = new OO.ui.FieldsetLayout( {
		classes: ["container"]
	    } );
	    RPPH[index].layouts.para4Layout = new OO.ui.FieldLayout( RPPH[index].widgets.para4TextInput );
	    RPPH[index].layouts.para4Fieldset.addItems( [ RPPH[index].layouts.para4Layout ] );
	    //Protection settings
	    RPPH[index].layouts.protectionSettingsFieldset = new OO.ui.FieldsetLayout( {
		label: "Protection settings",
		classes: ["container"]
	    } );
	    RPPH[index].layouts.durationLayout = new OO.ui.FieldLayout(
		new OO.ui.Widget( {
		    content: [ new OO.ui.HorizontalLayout( {
			items: [ RPPH[index].widgets.durationNumInput, RPPH[index].widgets.unitsButtonSelect ]
		    } ) ]
		} ),
		{
		    label: 'Duration',
		    align: 'top'
		}
	    );
	    RPPH[index].layouts.logpageReasonLayout = new OO.ui.FieldLayout(
		new OO.ui.Widget( {
		    content: [ new OO.ui.HorizontalLayout( {
			items: [ RPPH[index].widgets.presetReasonDropDown_edit, RPPH[index].widgets.presetReasonDropDown_move, RPPH[index].widgets.presetReasonDropDown_create, RPPH[index].widgets.additionalReasonTextInput ]
		    } ) ]
		} ),
		{
		    label: 'Reason (for log page)',
		    align: 'top'
		}
	    );
	    //Special log input for unpr option
	    RPPH[index].widgets.unprLogTextInput = new OO.ui.TextInputWidget();//para4TextInput
	    RPPH[index].layouts.unprLogFieldset = new OO.ui.FieldsetLayout( {
		classes: ["container"]
	    } );
	    RPPH[index].layouts.unprLogLayout = new OO.ui.FieldLayout(RPPH[index].widgets.unprLogTextInput, {
		label: 'Log comments (required)'
	    } );
	    RPPH[index].layouts.unprLogFieldset.addItems( [ RPPH[index].layouts.unprLogLayout ] );

	    RPPH[index].layouts.tagToggleLayout = new OO.ui.FieldLayout( RPPH[index].widgets.tagToggleSwitch );
	    RPPH[index].layouts.tagToggleLayout.appendInlineLabel("Tag page with protection template");
	    RPPH[index].layouts.tagOptionsLayout = new OO.ui.FieldLayout( RPPH[index].widgets.tagOptionMultiselect );
	    RPPH[index].layouts.protectionSettingsFieldset.addItems( [
		RPPH[index].layouts.durationLayout,
		RPPH[index].layouts.logpageReasonLayout,
		RPPH[index].layouts.tagToggleLayout,
		RPPH[index].layouts.tagOptionsLayout
	    ] );
	    //Custom protection levels
	    RPPH[index].layouts.customProtectionSettingsFieldset = new OO.ui.FieldsetLayout( {
		label: "Protection level",
		classes: ["container"]
	    } );
	    RPPH[index].layouts.modifyEditProtLayout = new OO.ui.ActionFieldLayout(
		RPPH[index].widgets.customProtectionToggleSwitch_edit,
		RPPH[index].widgets.protectionLevelDropDown_edit,
		{ label:"Modify edit protection settings", align:"top" }
	    );
	    RPPH[index].layouts.modifyEditProtLayout.moveLabelToInline();
	    RPPH[index].layouts.modifyMoveProtLayout = new OO.ui.ActionFieldLayout(
		RPPH[index].widgets.customProtectionToggleSwitch_move,
		RPPH[index].widgets.protectionLevelDropDown_move,
		{ label:"Modify move protection settings", align:"top" }
	    );
	    RPPH[index].layouts.modifyMoveProtLayout.moveLabelToInline();

	    RPPH[index].layouts.modifyPcProtLayout = new OO.ui.ActionFieldLayout(
		RPPH[index].widgets.customProtectionToggleSwitch_pc,
		RPPH[index].widgets.protectionLevelDropDown_pc,
		{ label:"Modify pending changes settings", align:"top" }
	    );
	    RPPH[index].layouts.modifyPcProtLayout.moveLabelToInline();

	    RPPH[index].layouts.modifyCreateProtLayout = new OO.ui.ActionFieldLayout(
		RPPH[index].widgets.customProtectionToggleSwitch_create,
		RPPH[index].widgets.protectionLevelDropDown_create,
		{ label:"Modify creation protection settings", align:"top" }
	    );
	    RPPH[index].layouts.modifyCreateProtLayout.moveLabelToInline();

	    RPPH[index].layouts.customProtectionSettingsFieldset.addItems( [
		RPPH[index].layouts.modifyEditProtLayout,
		RPPH[index].layouts.modifyMoveProtLayout,
		RPPH[index].layouts.modifyPcProtLayout,
		RPPH[index].layouts.modifyCreateProtLayout
	    ] );
	    RPPH[index].layouts.customProtectionSettingsFieldset.$element.find(".rpph-dropdown-minwidth").css("min-width", "24em");

	    //additional fieldsets hidden initially
	    RPPH[index].layouts.para2Fieldset.hide();
	    RPPH[index].layouts.para3Fieldset.hide();
	    RPPH[index].layouts.para4Fieldset.hide();
	    RPPH[index].layouts.unprLogFieldset.hide();
	    RPPH[index].layouts.customProtectionSettingsFieldset.hide();
	    RPPH[index].layouts.protectionSettingsFieldset.hide();

	    //Show/hide inputs based on response dropdown selection
	    RPPH[index].widgets.responseDropdown.on('labelChange', function(){
		var selectedItem = RPPH[index].widgets.responseDropdown.getMenu().findSelectedItem();
		var selectedData = ( selectedItem ) ? selectedItem.getData() : false;
		if ( selectedData && selectedData.para2_label ) {
		    RPPH[index].layouts.unprLogFieldset.hide();
		    if ( selectedData.para2_label === "Duration" ) {
			RPPH[index].layouts.protectionSettingsFieldset.show();
			RPPH[index].layouts.customProtectionSettingsFieldset.hide();
			RPPH[index].layouts.para2Fieldset.hide();
			if ( selectedData.para1 === "move" ) {
			    RPPH[index].widgets.presetReasonDropDown_move.show();
			    RPPH[index].layouts.tagToggleLayout.show();
			    RPPH[index].layouts.tagOptionsLayout.show();
			} else if ( selectedData.para1 === "salt" ) {
			    RPPH[index].widgets.presetReasonDropDown_create.show();
			    RPPH[index].layouts.tagToggleLayout.hide();
			    RPPH[index].layouts.tagOptionsLayout.hide();
			} else {
			    RPPH[index].widgets.presetReasonDropDown_edit.show();
			    RPPH[index].layouts.tagToggleLayout.show();
			    RPPH[index].layouts.tagOptionsLayout.show();
			}
		    } else {
			RPPH[index].layouts.protectionSettingsFieldset.hide();
			RPPH[index].layouts.para2Fieldset.show();
			RPPH[index].layouts.para2Layout.setLabel(selectedData.para2_label);
		    }
		} else if ( selectedData && selectedData.para1 === "done" ) {
		    RPPH[index].layouts.customProtectionSettingsFieldset.show();
		    RPPH[index].customProtectionShowHideSettings();
		    RPPH[index].widgets.presetReasonDropDown_edit.show();
		    RPPH[index].layouts.para2Fieldset.hide();
		    RPPH[index].layouts.unprLogFieldset.hide();
		    RPPH[index].layouts.tagOptionsLayout.show();
		} else if ( selectedData && selectedData.para1 === "unpr" ) {
		    RPPH[index].layouts.para2Fieldset.hide();
		    RPPH[index].layouts.para3Fieldset.hide();
		    RPPH[index].layouts.para4Fieldset.hide();
		    RPPH[index].layouts.customProtectionSettingsFieldset.hide();
		    RPPH[index].layouts.protectionSettingsFieldset.hide();
		    RPPH[index].layouts.unprLogFieldset.show();
		} else {
		    //Hide para2 and protection settings fieldsets
		    RPPH[index].layouts.protectionSettingsFieldset.hide();
		    RPPH[index].layouts.unprLogFieldset.hide();
		    RPPH[index].layouts.customProtectionSettingsFieldset.hide();
		    RPPH[index].layouts.para2Fieldset.hide();
		}
		if ( selectedData && selectedData.para3_label ) {
		    RPPH[index].layouts.para3Fieldset.show();
		    RPPH[index].layouts.para3Layout.setLabel(selectedData.para3_label);
		} else {
		    RPPH[index].layouts.para3Fieldset.hide();
		}
		if ( selectedData && selectedData.para4_label ) {
		    RPPH[index].layouts.para4Fieldset.show();
		    RPPH[index].layouts.para4Layout.setLabel(selectedData.para4_label);
		} else {
		    RPPH[index].layouts.para4Fieldset.hide();
		}
	    } );

	    //--- Panel ---
	    RPPH[index].panel = new OO.ui.PanelLayout( {
		padded: true,
		expanded: false
	    } );
	    RPPH[index].panel.$element.append(
		RPPH[index].layouts.infoFieldset.$element,
		RPPH[index].layouts.responseFieldset.$element,
		RPPH[index].layouts.para2Fieldset.$element,
		RPPH[index].layouts.para3Fieldset.$element,
		RPPH[index].layouts.para4Fieldset.$element,
		RPPH[index].layouts.unprLogFieldset.$element,
		RPPH[index].layouts.customProtectionSettingsFieldset.$element,
		RPPH[index].layouts.protectionSettingsFieldset.$element
	    );

	    //--- Save Panel ---
	    RPPH[index].submitPanel = new OO.ui.PanelLayout( {
		$: RPPH[index].$,
		expanded: false
	    } );
	    RPPH[index].submitFieldset = new OO.ui.FieldsetLayout( {
		classes: ['container']
	    } );
	    RPPH[index].submitPanel.$element.append( RPPH[index].submitFieldset.$element );
	    RPPH[index].markAsDoneProgressLabel = new OO.ui.LabelWidget();
	    RPPH[index].markAsDoneProgressField = new OO.ui.FieldLayout( RPPH[index].markAsDoneProgressLabel );
	    RPPH[index].changeProtsProgressLabel = new OO.ui.LabelWidget();
	    RPPH[index].changeProtsProgressField = new OO.ui.FieldLayout( RPPH[index].changeProtsProgressLabel );
	    RPPH[index].changePendsProgressLabel = new OO.ui.LabelWidget();
	    RPPH[index].changePendsProgressField = new OO.ui.FieldLayout( RPPH[index].changePendsProgressLabel );
	    RPPH[index].issueTemplateProgressLabel = new OO.ui.LabelWidget();
	    RPPH[index].issueTemplateProgressField = new OO.ui.FieldLayout( RPPH[index].issueTemplateProgressLabel );
	    RPPH[index].stackLayout = new OO.ui.StackLayout( {
		items: [RPPH[index].panel, RPPH[index].submitPanel],
		padded: true
	    } );
	};

	//--- Create and display window ---
	// Create a factory
	myFactory = new OO.Factory();
	// Define dialogue subclass
	function MyProcessDialog( config ) { MyProcessDialog.parent.call( this, config ); }
	OO.inheritClass( MyProcessDialog, OO.ui.ProcessDialog );
	// Name, title, action buttons
	MyProcessDialog.static.name = 'rpph_dialog';
	MyProcessDialog.static.title = 'RPPHelper';
	MyProcessDialog.static.actions = [
	    { action: 'save', label: 'Done', flags: ['primary', 'progressive'] },
	    { label: 'Cancel', flags: 'safe' }
	];
	//Sizing
	MyProcessDialog.static.size = "large";
	MyProcessDialog.prototype.getBodyHeight = function () {
	    return 500;
	};
	//Content
	MyProcessDialog.prototype.initialize = function () {
	    MyProcessDialog.parent.prototype.initialize.apply( this, arguments );
	    this.$body.append(RPPH[RPPH.index].stackLayout.$element);
	    this.$overlay.append(RPPH[RPPH.index].overlayDiv);
	};

	//Good to go
	MyProcessDialog.prototype.onSubmit = function(data) {
	    var self = this, promiseCount;

	    self.actions.setAbilities( { submit: false } );

	    addPromise = function( field, promise, skip ) {
		if (skip === true) {
		    field.$field.append( $( '<span>' )
					 .text( 'Skipping' )
					 .prop('style', 'position:relative; top:0.5em; color: #000090; font-weight: bold'));
		    //		    promiseCount--; // FIXME: maybe we could use a self.isPending() or something
		    //		    self.popPending();
		    console.log('skip after poppending');
		    var tmp = Promise.resolve(100); //.then needs to return a promise, so give it one
		    return tmp;
		} else {
		    self.pushPending();

		    promise.done(function() {
			field.$field.append( $( '<span>' )
					     .text( 'Complete!' )
					     .prop('style', 'position:relative; top:0.5em; color: #009000; font-weight: bold')
					   );
		    }).fail(function(obj) {
			console.log('after promise fail');
			if ( obj && obj.error && obj.error.info ) {
			    field.$field.append( $( '<span>' )
						 .text('Error: ' + obj.error.info)
						 .prop('style', 'position:relative; top:0.5em; color: #cc0000; font-weight: bold')
					       );
			} else {
			    field.$field.append( $( '<span>' )
						 .text('An unknown error occurred.')
						 .prop('style', 'position:relative; top:0.5em; color: #cc0000; font-weight: bold')
					       );
			}
		    }).always( function() {
			promiseCount--; // FIXME: maybe we could use a self.isPending() or something
			self.popPending();

			if (promiseCount === 0) {
			    setTimeout(function() {
				location.hash=mw.config.get('wgPageName').replace(/ /g, '_');
				location.reload(true);
				self.close( { inputData: data.inputData } );
			    }, 1000);
			}
		    });
		    console.log('return promise');
		    return promise;
		}
	    };

	    RPPH[RPPH.index].markAsDoneProgressField.setLabel( 'Responding to request...' );
	    RPPH[RPPH.index].submitFieldset.addItems( [RPPH[RPPH.index].markAsDoneProgressField] );

	    console.log("inputData"); console.log(data.inputData);
	    var resp = data.inputData.additionalResponse ? data.inputData.additionalResponse : '';
	    var endg = '}} ' + resp + ' ~~~~';
	    var para = data.inputData.para1;
	    var begn = '\n:{{RFPP|' + para;
	    var secE = RPPH[RPPH.index].req_data.editsection;
	    var secN = RPPH[RPPH.index].req_data.section_header.slice(1);
	    var page = RPPH[RPPH.index].req_data.page_data[0].pageTitle;
	    var labl = data.inputData.label;
	    if (data.inputData.filter === 'accept') {
		promiseCount = 4;
		var level;
		var pcLevel;

		RPPH[RPPH.index].changeProtsProgressField.setLabel( 'Applying protection...' );
		RPPH[RPPH.index].submitFieldset.addItems( [RPPH[RPPH.index].changeProtsProgressField] );
		RPPH[RPPH.index].changePendsProgressField.setLabel( 'Applying pending changes...' );
		RPPH[RPPH.index].submitFieldset.addItems( [RPPH[RPPH.index].changePendsProgressField] );
		RPPH[RPPH.index].issueTemplateProgressField.setLabel( 'Tagging page...' );
		RPPH[RPPH.index].submitFieldset.addItems( [RPPH[RPPH.index].issueTemplateProgressField] );

		var durPr = data.inputData.duration ? data.inputData.duration : 'indefinite'; //Required for unpr, likely replaced below
		var durPc = durPr; //Won't change format, unlike durPr which may have multiple durations
		var exp = durPc; //Don't want duration in the marked response to unpr or done, so copy and replace
		var tag = data.inputData.pp + '\n';

		if (para === 'semi' || para === 'full' || para === 'temp' || para === 'excp') {
		    if (data.inputData.editLevel) {
			level = 'edit=' + data.inputData.editLevel;
			durPr = data.inputData.editDur;
		    }
		    if (data.inputData.moveLevel) {
			level += level ? '|' : '';
			level += 'move=' + data.inputData.moveLevel;
			durPr = level ? durPr + '|' : '';
			durPr += data.inputData.moveDur;
		    }
		} else if (para === 'pend') {
		    pcLevel = data.inputData.pcLevel;
		} else if (para === 'move') {
		    level = 'move=' + data.inputData.moveLevel;
		    durPr = data.inputData.moveDur;
		} else if (para === 'salt') {
		    level = 'create=' + data.inputData.saltLevel;
		    durPr = data.inputData.saltDur;
		} else if (para === 'unpr') {
		    exp = '';
		    if (RPPH[RPPH.index].req_data.pageid === '-1') {
			level = 'create=all';
			data.inputData.editLevel = undefined;
			data.inputData.moveLevel = undefined;
			data.inputData.pcLevel = undefined;
		    } else {
			data.inputData.saltLevel = undefined;
			level = 'edit=all|move=all';
			//Can't PC outside of main or project
			if (RPPH[RPPH.index].req_data.page.ns === 0 || RPPH[RPPH.index].req_data.page.ns === 4) {
			    pcLevel = 'none';
			}
		    }
		} else if (para === 'done') {
		    exp = '';
		    if (RPPH[RPPH.index].req_data.pageid === '-1') {
			level = 'create=' + data.inputData.saltLevel;
			data.inputData.editLevel = undefined;
			data.inputData.moveLevel = undefined;
			data.inputData.pcLevel = undefined;
			durPr = data.inputData.saltDur;
		    } else {
			if (data.inputData.editLevel) {
			    level = 'edit=' + data.inputData.editLevel;
			    durPr = data.inputData.editDur;
			}
			if (data.inputData.moveLevel) {
			    level = data.inputData.editLevel ? level + '|' : '';
			    level += 'move=' + data.inputData.moveLevel;
			    durPr = data.inputData.editLevel ? durPr + '|' : '';
			    durPr += data.inputData.moveDur;
			}
			if (data.inputData.pcLevel) {
			    pcLevel = data.inputData.pcLevel;
			}
		    }
		}

		console.log("ACCEPT — begn + '|' + exp + endg, secE, page, labl, exp");
		console.log(begn + '|' + exp + endg, secE, page, labl, exp);
		console.log("PROTECT — data.inputData.logReason, page, secN, level, durPr");
		console.log(data.inputData.logReason, page, secN, level, durPr);
		console.log("PENDING — data.inputData.logReason, page, secN, pcLevel, durPc");
		console.log(data.inputData.logReason, page, secN, pcLevel, durPc);
		console.log("ISSUETEMPLATE — page, tag");
		console.log(page, tag);

		console.log('before promises after process');
		console.log(data.inputData);

		addPromise(
		    RPPH[RPPH.index].markAsDoneProgressField, markAsDone(begn + '|' + exp + endg, secE, page, labl, exp), 'false'
		).then(function(revs) {
		    var skip = true;
		    if (data.inputData.editLevel || data.inputData.moveLevel || data.inputData.saltLevel) {
			skip = false;
		    } else {
			promiseCount--;
		    }
		    addPromise(
			RPPH[RPPH.index].changeProtsProgressField, assignProtection(data.inputData.logReason, page, revs.edit.newrevid, secN, level, durPr, skip), skip
		    ).then(function() {
			var skip = true;
			if (data.inputData.pcLevel) {
			    skip = false;
			} else {
			    promiseCount--;
			}
			addPromise(
			    RPPH[RPPH.index].changePendsProgressField, assignPendingChanges(data.inputData.logReason, page, revs.edit.newrevid, secN, pcLevel, durPc, skip), skip
			).then(function() {
			    var skip = true;
			    if (RPPH[RPPH.index].widgets.tagToggleSwitch.getValue() && data.inputData.para1 !== 'unpr' && typeof data.inputData.saltLevel === 'undefined' ) {
				skip = false;
			    } else {
				promiseCount--;
				//If skipped, we won't process the end of the addPromise chain
				//So recreate it here
				setTimeout(function() {
				    location.hash=mw.config.get('wgPageName').replace(/ /g, '_');
				    location.reload(true);
				    self.close( { inputData: data.inputData } );
				}, 1000);
			    }
			    addPromise(
				RPPH[RPPH.index].issueTemplateProgressField, issueTemplate(page, tag, skip), skip
			    );
			}.bind(this));
		    }.bind(this));
		}.bind(this));
	    } else if (data.inputData.filter === 'decline') {
		promiseCount = 1;
		var para2 = data.inputData.para2 ? data.inputData.para2 : '';
		var para3 = data.inputData.para3 ? data.inputData.para3 : '';
		var para4 = data.inputData.para4 ? '; Reply to ' + data.inputData.para4 : '';
		console.log("DECLINE — begn + '|' + para2 + '|' + para3 + endg, secE, page, labl");
		console.log(begn + '|' + para2 + '|' + para3 + endg, secE, page, labl);
		addPromise(
		    RPPH[RPPH.index].markAsDoneProgressField,
		    markAsDone(begn + '|' + para2 + '|' + para3 + endg, secE, page, labl, '', para4)
		);
	    } else if (data.inputData.filter === 'other') {
		promiseCount = 1;
		var sysPara = data.inputData.para2 ? '|' + data.inputData.para2 : '';
		var sysBy = data.inputData.para2 ? 'by ' + data.inputData.para2 : '';
		console.log("OTHER — begn + sysPara + endg, secE, page, labl, sysBy");
		console.log(begn + sysPara + endg, secE, page, labl, sysBy);
		addPromise(
		    RPPH[RPPH.index].markAsDoneProgressField,
		    markAsDone(begn + sysPara + endg, secE, page, labl, sysBy)
		);
	    }
	    RPPH[RPPH.index].stackLayout.setItem( RPPH[RPPH.index].submitPanel );
	};

	//Processes when action buttons are clicked
	MyProcessDialog.prototype.getActionProcess = function (action) {
	    var dialog = this;
	    if ( action ) {
		return new OO.ui.Process( function() {
		    // gather data, validate responses
		    var index = RPPH.index;
		    var valid = true;
		    var inputData = {};

		    // Lookups for saving previous info
		    var protLookup = {
			'edit': 'editLevel',
			'move': 'moveLevel'/*,
					     'create': 'saltLevel'*/
		    };
		    var durLookup = {
			'edit': 'editDur',
			'move': 'moveDur'/*,
					   'create': 'saltDur'*/
		    };
		    $.each(RPPH[index].req_data.page.protection, function(k, prot) {
			if (protLookup[prot.type]) {
			    inputData[protLookup[prot.type]] = prot.level;
			    inputData[durLookup[prot.type]] = prot.expiry;
			}
		    });

		    console.log('testing new');
		    console.log(inputData);

		    var responseItemData;
		    //response para1
		    var responseItem = RPPH[index].widgets.responseDropdown.getMenu().findSelectedItem();
		    if ( responseItem ) {
			inputData.label = responseItem.label;
			responseItemData = responseItem.getData();
			inputData.filter = responseItemData.filter;
			inputData.para1 = responseItemData.para1;
		    } else {
			valid = false;
			RPPH[index].layouts.responseLayouts[1].setNotices(['Required']); //Should really be responseLayouts[0].items[0], but that return a not a function error
		    }
		    //response para2
		    if ( RPPH[index].layouts.para2Layout.isVisible() ) {
			var para2input = RPPH[index].widgets.para2TextInput.getValue().trim();
			if ( para2input ) {
			    //escape loose pipes
			    inputData.para2 = para2input.replace(/(\|)(?!(?:[^\[]*]|[^\{]*}))/g, "&#124;");
			}
		    }
		    //response para3
		    if ( RPPH[index].layouts.para3Layout.isVisible() ) {
			var para3input = RPPH[index].widgets.para3TextInput.getValue().trim();
			if ( para3input ) {
			    //escape loose pipes
			    inputData.para3 = para3input.replace(/(\|)(?!(?:[^\[]*]|[^\{]*}))/g, "&#124;");
			}
		    }
		    //response para4
		    if ( RPPH[index].layouts.para4Layout.isVisible() ) {
			var para4input = RPPH[index].widgets.para4TextInput.getValue().trim();
			if ( para4input ) {
			    //escape loose pipes
			    inputData.para4 = para4input.replace(/(\|)(?!(?:[^\[]*]|[^\{]*}))/g, "&#124;");
			}
		    }
		    //additional response comments
		    var additionalResponse = RPPH[index].widgets.additionalTextInput.getValue().trim();
		    if ( additionalResponse ) {
			inputData.additionalResponse = additionalResponse;
		    } else if ( inputData.para1 === 'ques' || inputData.para1 === 'note' ) {
			valid = false;
			var q_n = ( inputData.para1 === 'ques' ) ? 'question' : 'note';
			RPPH[index].layouts.responseLayouts[1].setNotices(['Enter your ' + q_n]);
		    }

		    //Can't PC outside of main or project
		    if (typeof inputData.pcLevel !== 'undefined' && RPPH[RPPH.index].req_data.page.ns !== 0 && RPPH[RPPH.index].req_data.page.ns !== 4) {
			valid = false;
			RPPH[index].layouts.logpageReasonLayout.setNotices(["Can't PC outside of main or project space"]);
		    }
		    //Only create protection is valid if the page doesn't exist
		    if (RPPH[RPPH.index].req_data.pageid === '-1' && (inputData.editLevel || inputData.moveLevel || inputData.pcLevel)) {
			valid = false;
			RPPH[index].layouts.logpageReasonLayout.setNotices(["Can't protect what doesn't exist!"]);
		    }

		    if ( RPPH[index].layouts.protectionSettingsFieldset.isVisible() ) {
			//duration
			var duration = RPPH[index].widgets.unitsButtonSelect.findSelectedItem().getData();
			console.log('durationsss');
			console.log(duration);
			if ( !RPPH[index].widgets.durationNumInput.isDisabled() ) {
			    duration = RPPH[index].widgets.durationNumInput.getValue() ? RPPH[index].widgets.durationNumInput.getValue().trim() + " " + duration : 'indefinite'; //In case the input is left blank
			    console.log(duration);
			}
			console.log(duration);
			inputData.duration = duration;
			console.log(duration);
		    }

		    //protection settings
		    switch ( inputData.para1 ) {
		    case "semi":
			inputData.editLevel = "autoconfirmed";
			inputData.editDur = inputData.duration;
			//inputData.moveLevel = "autoconfirmed";
			break;
		    case "pend":
			inputData.pcLevel = "autoconfirmed";
			break;
		    case "full":
			inputData.editLevel = "sysop";
			inputData.editDur = inputData.duration;
			inputData.moveLevel = "sysop";
			inputData.moveDur = inputData.duration;
			break;
		    case "move":
			inputData.moveLevel = "sysop";
			inputData.moveDur = inputData.duration;
			break;
		    case "salt":
			if (RPPH[RPPH.index].req_data.pageid !== '-1') {
			    valid = false;
			    RPPH[index].layouts.logpageReasonLayout.setNotices(["Can't salt what already exists!"]);
			}
			inputData.saltLevel = responseItemData.level;
			inputData.saltDur = inputData.duration;
			break;
		    case "temp":
			inputData.editLevel = "templateeditor";
			inputData.editDur = inputData.duration;
			inputData.moveLevel = "templateeditor";
			inputData.moveDur = inputData.duration;
			break;
		    case "excp":
			inputData.editLevel = "extendedconfirmed";
			inputData.editDur = inputData.duration;
			inputData.moveLevel = "extendedconfirmed";
			inputData.moveDur = inputData.duration;
			break;
		    case "done":
			if ( RPPH[index].widgets.customProtectionToggleSwitch_edit.value ) {
			    inputData.editLevel = RPPH[index].widgets.protectionLevelDropDown_edit.getMenu().findSelectedItem().getData();
			    inputData.editDur = inputData.duration;
			}
			if ( RPPH[index].widgets.customProtectionToggleSwitch_move.value ) {
			    inputData.moveLevel = RPPH[index].widgets.protectionLevelDropDown_move.getMenu().findSelectedItem().getData();
			    inputData.moveDur = inputData.duration;
			}
			if ( RPPH[index].widgets.customProtectionToggleSwitch_pc.value ) {
			    inputData.pcLevel = RPPH[index].widgets.protectionLevelDropDown_pc.getMenu().findSelectedItem().getData();
			}
			if ( RPPH[index].widgets.customProtectionToggleSwitch_create.value ) {
			    inputData.saltLevel = RPPH[index].widgets.protectionLevelDropDown_create.getMenu().findSelectedItem().getData();
			    inputData.saltDur = inputData.duration;
			}
			break;
		    case "unpr":
			if ( !RPPH[index].currentProtectionLevels ) {
			    valid = false;
			    RPPH[index].layouts.unprLogLayout.setNotices(["Page isn't protected!"]);
			}
			if (RPPH[RPPH.index].req_data.pageid === '-1') {
			    inputData.saltLevel = "all";
			    inputData.editLevel = undefined;
			    inputData.moveLevel = undefined;
			    inputData.pcLevel = undefined;
			} else {
			    inputData.saltLevel = undefined;
			    inputData.editLevel = "all";
			    inputData.moveLevel = "all";
			    //Can only PC in main or project space
			    if (RPPH[RPPH.index].req_data.page.ns === 0 || RPPH[RPPH.index].req_data.page.ns === 4) {
				inputData.pcLevel = "none";
			    }
			}
			break;
		    }

		    if ( RPPH[index].layouts.protectionSettingsFieldset.isVisible() ) {
			//reason
			var reasonData = ( RPPH[index].widgets.presetReasonDropDown_edit.isVisible() && RPPH[index].widgets.presetReasonDropDown_edit.getMenu().findSelectedItem() && RPPH[index].widgets.presetReasonDropDown_edit.getMenu().findSelectedItem().getData() ) ||
			    ( RPPH[index].widgets.presetReasonDropDown_move.isVisible() && RPPH[index].widgets.presetReasonDropDown_move.getMenu().findSelectedItem() && RPPH[index].widgets.presetReasonDropDown_move.getMenu().findSelectedItem().getData() ) ||
			    ( RPPH[index].widgets.presetReasonDropDown_create.isVisible() && RPPH[index].widgets.presetReasonDropDown_create.getMenu().findSelectedItem() && RPPH[index].widgets.presetReasonDropDown_create.getMenu().findSelectedItem().getData() );
			var additionalReason = RPPH[index].widgets.additionalReasonTextInput.getValue().trim();
			if (typeof reasonData.wikitext !== 'undefined' && (reasonData.wikitext || additionalReason)) {
			    if ( reasonData.wikitext && additionalReason ) {
				inputData.logReason = reasonData.wikitext + ": " + additionalReason;
			    } else {
				inputData.logReason = reasonData.wikitext || additionalReason;
			    }
			} else {
			    valid = false;
			    RPPH[index].layouts.logpageReasonLayout.setNotices(['A reason is required!']);
			}
			//pp tag
			if ( typeof reasonData.pp !== 'undefined' && RPPH[index].widgets.tagToggleSwitch.isVisible() && RPPH[index].widgets.tagToggleSwitch.getValue() ) {
			    if (inputData.pcLevel && !inputData.editLevel && !inputData.moveLevel) {
				console.log('HERE');
				console.log(inputData);
				inputData.pp = "{{pp-pc";
			    } else {
				console.log('AYYO');
				console.log(inputData);
				inputData.pp = "{{pp-" + reasonData.pp;
			    }
			    if ( RPPH[index].widgets.tagOption_icon.isSelected() ) {
				inputData.pp += "|small=yes}}";
			    } else {
				inputData.pp += "}}";
			    }
			    if ( RPPH[index].widgets.tagOption_noinclude.isSelected() ) {
				inputData.pp = "<noinclude>" + inputData.pp + "</noinclude>";
			    }
			}
		    } else if (RPPH[index].layouts.unprLogFieldset.isVisible()) {
			inputData.logReason = RPPH[index].widgets.unprLogTextInput.getValue().trim();
			if ( !inputData.logReason ) {
			    valid = false;
			    RPPH[index].layouts.unprLogLayout.setNotices(['A reason is required!']);
			}
		    }



		    RPPH.Api.get({
			format: 'json',
			indexpageids: true,
			action: 'query',
			prop: 'revisions',
			rvprop: 'ids',
			titles: mw.config.get('wgPageName')
		    }).then(function(tmpData) {
			var tmpRev = tmpData.query.pages[tmpData.query.pageids[0]].revisions[0].revid;
			console.log('RPPH.revid');
			console.log(RPPH.revid);
			console.log('tmpRev');
			console.log(tmpRev);
			if (tmpRev != RPPH.revid) {
			    valid = false;
			    console.log('mismatch - valid?');
			    console.log(valid);
			    RPPH[RPPH.index].markAsDoneProgressField.setLabel( 'Mismatched revID, someone edited this page.  Reloading...' );
			    RPPH[RPPH.index].submitFieldset.addItems( [RPPH[RPPH.index].markAsDoneProgressField] );
			    RPPH[RPPH.index].stackLayout.setItem( RPPH[RPPH.index].submitPanel );
			    setTimeout(function() {
				location.hash=mw.config.get('wgPageName').replace(/ /g, '_');
				location.reload(true);
			    }, 1000);
			}
			console.log('validagain');
			console.log(valid);
			if ( valid ) { //Only here in the .done because the above api.get is the last to affect valid
			    dialog.onSubmit( { inputData: inputData } );
			}
		    });
		} );
	    } else {
		return MyProcessDialog.parent.prototype.getActionProcess.call( this, action );
	    }
	};

	function assignProtection(summary, pageName, revid, sectionName, prots, expiry, skip) {
	    revid = ' ([[Special:PermaLink/' + revid + '#' + sectionName + '|requested at RFPP]])';
	    console.log('prot=');
	    if (skip) {
		return skip;
	    }
	    return RPPH.Api.postWithToken( 'csrf', {
		action: 'protect',
		format: 'json',
		title: pageName,
		protections: prots,
		reason: summary + revid,
		expiry: expiry,
		errorformat: 'plaintext'
	    }).done( function ( dun ) {
		console.log('prot=done');
		console.log(dun);
	    }).fail( function (fail) {
		console.log('fail');
		console.log(fail);
	    } );
	}
	function assignPendingChanges(summary, pageName, revid, sectionName, level, expiry, skip) {
	    revid = ' ([[Special:PermaLink/' + revid + '#' + sectionName + '|requested at RFPP]])';
	    console.log('pend=');
	    if (skip) {
		return skip;
	    }
	    return RPPH.Api.postWithToken( 'csrf', {
		action: 'stabilize',
		format: 'json',
		title: pageName,
		protectlevel: level,
		reason: summary + revid,
		expiry: expiry,
		errorformat: 'plaintext'
	    }).done( function ( dun ) {
		console.log('pend=done');
		console.log(dun);
	    }).fail( function (fail) {
		console.log('fail');
		console.log(fail);
	    } );
	}
	function markAsDone(closingRemarks, sectionNumber, pageName, result, expiry, reply) {
	    var expire = expiry ? ' ' + expiry : '';
	    var replyTo = reply ? reply : '';
	    console.log('mark=');
	    return RPPH.Api.postWithToken( 'csrf', {
		format: 'json',
		action: 'edit',
		title: mw.config.get('wgPageName'),
		section: sectionNumber,
		summary: '/* ' + pageName + ' */ ' + result + expire + replyTo,
		appendtext: closingRemarks,
		watchlist: 'nochange',
		errorformat: 'plaintext'
	    }).done( function ( dun ) {
		console.log('mark=done');
		console.log(dun);
	    }).fail( function (fail) {
		console.log('fail');
		console.log(fail);
	    } );
	}
	function issueTemplate(taggedPage, pp, skip) {
	    console.log('temp=');
	    if (skip) {
		return skip;
	    }
	    return RPPH.Api.postWithToken( 'csrf', {
		format: 'json',
		action: 'edit',
		title: taggedPage,
		section: '0',
		summary: 'Tagging page with protection template',
		prependtext: pp,
		watchlist: 'watch',
		errorformat: 'plaintext'
	    }).done( function ( dun ) {
		console.log('temp=done');
		console.log(dun);
	    }).fail( function (fail) {
		console.log('fail');
		console.log(fail);
	    } );
	}
	// Register the window constructor with the factory.
	myFactory.register( MyProcessDialog );

	var makeRpphInterface = function(req_data){
	    console.log("req_data = "); console.log(req_data);
	    initiateInterfaceElements(req_data);
	    // Create new window manager
	    var windowManager = new OO.ui.WindowManager( { factory: myFactory } );
	    $( 'body' ).append( windowManager.$element );
	    instance = windowManager.openWindow( "rpph_dialog" );
	    console.log('RPPH');
	    console.log(RPPH[RPPH.index]);
	    instance.closed.then( function ( data ) {
		if ( data && data.inputData ) {
		    console.log("Success!  Closing...");
		    $('#RPPH-doing')[0].innerHTML = ' Done';
		} else {
		    console.log("nill data");
		    $('#RPPH-doing').parent().children().first().show();
		    $('#RPPH-doing').remove();
		}
		windowManager.destroy();
	    } );
	};

	//End of full file closure wrappers
    });
});
//</nowiki>
