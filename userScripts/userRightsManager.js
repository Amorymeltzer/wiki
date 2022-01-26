//Taken from https://en.wikipedia.org/w/index.php?title=User:MusikAnimal/userRightsManager.js&oldid=831137097
//Add a few custom templates [[User:MusikAnimal/userRightsManager.js]]

// <nowiki>
// Some UI code adapted from [[User:Mr. Stradivarius/gadgets/Draftify.js]]
(function() {
    if (!/Wikipedia:Requests for permissions\//.test(document.title)) {
	return;
    }

    var permissionNames = {
	'Account creator': 'accountcreator',
	'Autopatrolled': 'autoreviewer',
	'Confirmed': 'confirmed',
	'Event coordinator': 'eventcoordinator',
	'Extended confirmed': 'extendedconfirmed',
	'File mover': 'filemover',
	'Mass message sender': 'massmessage-sender',
	'New page reviewer': 'patroller',
	'Page mover': 'extendedmover',
	'Pending changes reviewer': 'reviewer',
	'Rollback': 'rollbacker',
	'Template editor': 'templateeditor'
    };

    var templates = {
	'Account creator': 'Account creator granted',
	'Autopatrolled': 'Autopatrolledgiven',
	'AutoWikiBrowser': '',
	'Confirmed': 'User:Amorymeltzer/perm/Confirmed granted',
	'Event coordinator': 'Event coordinator granted',
	'Extended confirmed': 'User:Amorymeltzer/perm/Extended confirmed granted',
	'File mover': 'Filemovergiven',
	'Mass message sender': 'Mass message sender granted',
	'New page reviewer': 'New Page Reviewer granted',
	'Page mover': 'Page mover granted',
	'Pending changes reviewer': 'Pending changes reviewer granted',
	'Rollback': 'Rollback granted 3',
	'Template editor': 'Template editor granted'
    };

    var api,
	permission = mw.config.get('wgTitle').split('/').slice(-1)[0],
	revisionId = mw.config.get('wgRevisionId'),
	tagLine = ' (using [[User:MusikAnimal/userRightsManager|userRightsManager]])',
	permaLink, userName, dialog;

    mw.loader.using(['oojs-ui', 'mediawiki.api', 'mediawiki.widgets.DateInputWidget'], function() {
	api = new mw.Api();
	$('.perm-assign-permissions a').on('click', function(e) {
	    if (permission === 'AutoWikiBrowser') return true;
	    e.preventDefault();
	    userName = $(this).parents('.plainlinks').find('a').eq(0).text();
	    showDialog();
	});
    });

    function showDialog() {
	Dialog = function(config) {
	    Dialog.super.call(this, config);
	};
	OO.inheritClass(Dialog, OO.ui.ProcessDialog);
	Dialog.static.name = 'user-rights-manager';
	Dialog.static.title = 'Grant ' + permission + ' to ' + userName;
	Dialog.static.actions = [
	    { action: 'submit', label: 'Submit', flags: ['primary', 'constructive'] },
	    { label: 'Cancel', flags: 'safe' }
	];
	Dialog.prototype.getApiManager = function() {
	    return this.apiManager;
	};
	Dialog.prototype.getBodyHeight = function() {
	    return 208;
	};
	Dialog.prototype.initialize = function() {
	    Dialog.super.prototype.initialize.call( this );
	    this.editFieldset = new OO.ui.FieldsetLayout( {
		classes: ['container']
	    });
	    this.editPanel = new OO.ui.PanelLayout({
		expanded: false
	    });
	    this.editPanel.$element.append( this.editFieldset.$element );
	    this.rightsChangeSummaryInput = new OO.ui.TextInputWidget({
		value: 'Requested at [[WP:PERM]]'
	    });
	    this.expiryInput = new mw.widgets.DateInputWidget({
		$overlay: $('.oo-ui-window')
	    });
	    this.closingRemarksInput = new OO.ui.TextInputWidget({
		value: '{{done}} ~~~~'
	    });
	    this.watchTalkPageCheckbox = new OO.ui.CheckboxInputWidget({
		selected: false
	    });
	    var formElements = [
		new OO.ui.FieldLayout(this.rightsChangeSummaryInput, {
		    label: 'Summary'
		}),
		new OO.ui.FieldLayout(this.expiryInput, {
		    label: 'Expiry (optional)'
		}),
		new OO.ui.FieldLayout(this.closingRemarksInput, {
		    label: 'Closing remarks'
		})
	    ];
	    if (!!templates[permission]) {
		formElements.push(
		    new OO.ui.FieldLayout(this.watchTalkPageCheckbox, {
			label: 'Watch user talk page'
		    })
		);
	    }
	    this.editFieldset.addItems(formElements);
	    this.submitPanel = new OO.ui.PanelLayout( {
		$: this.$,
		expanded: false
	    } );
	    this.submitFieldset = new OO.ui.FieldsetLayout( {
		classes: ['container']
	    } );
	    this.submitPanel.$element.append( this.submitFieldset.$element );
	    this.changeRightsProgressLabel = new OO.ui.LabelWidget();
	    this.changeRightsProgressField = new OO.ui.FieldLayout( this.changeRightsProgressLabel );
	    this.markAsDoneProgressLabel = new OO.ui.LabelWidget();
	    this.markAsDoneProgressField = new OO.ui.FieldLayout( this.markAsDoneProgressLabel );
	    this.issueTemplateProgressLabel = new OO.ui.LabelWidget();
	    this.issueTemplateProgressField = new OO.ui.FieldLayout( this.issueTemplateProgressLabel );
	    this.stackLayout = new OO.ui.StackLayout( {
		items: [this.editPanel, this.submitPanel],
		padded: true
	    } );
	    this.$body.append( this.stackLayout.$element );
	    $( '.mw-widget-dateInputWidget' ).css( 'width', '100%' );
	};

	Dialog.prototype.onSubmit = function() {
	    var self = this, promiseCount = !!templates[permission] ? 3 : 2;

	    self.actions.setAbilities( { submit: false } );

	    addPromise = function( field, promise ) {
		self.pushPending();
		promise.done(function() {
		    field.$field.append( $( '<span>' )
					 .text( 'Complete!' )
					 .prop('style', 'position:relative; top:0.5em; color: #009000; font-weight: bold')
				       );
		}).fail(function(obj) {
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
			    location.reload(true);
			}, 1000);
		    }
		});

		return promise;
	    };

	    self.markAsDoneProgressField.setLabel( 'Marking request as done...' );
	    self.submitFieldset.addItems( [self.markAsDoneProgressField] );
	    self.changeRightsProgressField.setLabel( 'Assigning rights...' );
	    self.submitFieldset.addItems( [self.changeRightsProgressField] );

	    if (!!templates[permission]) {
		self.issueTemplateProgressField.setLabel( 'Issuing template...' );
		self.submitFieldset.addItems( [self.issueTemplateProgressField] );
	    }

	    addPromise(
		self.markAsDoneProgressField,
		markAsDone('\n:' + this.closingRemarksInput.getValue())
	    ).then(function(data) {
		addPromise(
		    self.changeRightsProgressField,
		    assignPermission(
			this.rightsChangeSummaryInput.getValue(),
			data.edit.newrevid,
			this.expiryInput.getValue()
		    )
		).then(function() {
		    // silently add user to MMS list
		    if (permission === 'New page reviewer') {
			addToMMSList();
		    } else if (permission === 'Autopatrolled') {
			updateWhiteList();
		    }

		    if (!!templates[permission]) {
			addPromise(
			    self.issueTemplateProgressField,
			    issueTemplate(this.watchTalkPageCheckbox.isSelected(), this.expiryInput.getValue())
			);
		    }
		}.bind(this));
	    }.bind(this));

	    self.stackLayout.setItem( self.submitPanel );
	};

	Dialog.prototype.getActionProcess = function( action ) {
	    return Dialog.super.prototype.getActionProcess.call( this, action ).next( function() {
		if ( action === 'submit' ) {
		    return this.onSubmit();
		} else {
		    return Dialog.super.prototype.getActionProcess.call( this, action );
		}
	    }, this );
	};

	dialog = new Dialog({
	    size: 'medium'
	});

	var windowManager = new OO.ui.WindowManager();
	$('body').append(windowManager.$element);
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);
    }

    function assignPermission(summary, revId, expiry) {
	permaLink = '[[Special:PermaLink/' + revId + '#User:' + userName + '|permalink]]';
	return api.postWithToken( 'userrights', {
	    action: 'userrights',
	    format: 'json',
	    user: userName.replace(/ /g, '_'),
	    add: permissionNames[permission],
	    reason: '+' + permissionNames[permission] + '; ' + summary + '; ' + permaLink + tagLine,
	    expiry: expiry === '' ? 'infinity' : expiry
	});
    }

    function markAsDone(closingRemarks) {
	var sectionNode = document.getElementById('User:' + userName.replace(/"/g, '.22').replace(/ /g, '_')),
	    sectionNumber = $(sectionNode).siblings('.mw-editsection').find("a:not('.mw-editsection-visualeditor')").prop('href').match(/section=(\d+)/)[1];
	return api.postWithToken( 'edit', {
	    format: 'json',
	    action: 'edit',
	    title: mw.config.get('wgPageName'),
	    section: sectionNumber,
	    summary: '/* User:' + userName + ' */ done' + tagLine,
	    appendtext: closingRemarks
	});
    }

    function issueTemplate(watch, expiry) {
	var talkPage = 'User talk:' + userName.replace(/ /g, '_');
	return api.postWithToken( 'edit', {
	    format: 'json',
	    action: 'edit',
	    title: talkPage,
	    section: 'new',
	    summary: permission + ' granted per ' + permaLink + tagLine,
	    text: '{{subst:' + templates[permission] + (expiry === '' ? '' : '|expiry=' + expiry) + '}}',
	    sectiontitle: permission + ' granted',
	    watchlist: watch ? 'watch' : 'unwatch'
	});
    }

    function addToMMSList() {
	api.postWithToken( 'csrf', {
	    format: 'json',
	    action: 'editmassmessagelist',
	    spamlist: 'Wikipedia:New pages patrol/Reviewers/Newsletter list',
	    add: 'User talk:' + userName
	});
    }

    function updateWhiteList() {
        api.edit( 'Wikipedia:New pages patrol/Redirect whitelist', function (revision) {
            var newContent = revision.content.replace(
                new RegExp('\\*\\s*{{\\s*user2\\s*\\|\\s*' + userName + '\\s*}}\\n'),
                ''
            );
            return {
                text: newContent,
                summary: 'Removing ' + userName + ' who is now autopatrolled' + tagLine,
                minor: true
            };
        });
    }
})();
// </nowiki>
