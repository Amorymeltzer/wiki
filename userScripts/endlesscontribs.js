// Taken from [[User:Bradv/endlesscontribs.js]] (as of [[Special:PermaLink/995418220]]) to test post-running function
(function( $, mw ) {
    'use strict';

    if (mw.config.get('wgCanonicalSpecialPageName')==='Contributions') {
        mw.loader.using("mediawiki.util").then(function () {
            const css = mw.util.addCSS(`
                body.endlesscontribs .mw-pager-navigation-bar:not(:first-of-type) {
                    display: none;
                }
                #endlesscontribs {
                    margin: 1em;
                }
            `);

            var nexturl = $('a[rel="next"]').attr('href');
            if (nexturl) {
                var loading = false;

                const button = $('<span>', {
                    'id': 'endlesscontribs',
                    'class': 'mw-ui-button mw-ui-progressive'})
                .text('Load more')
                .insertAfter($('.mw-contributions-list'))
                .click(function () {
                    $('body').addClass('endlesscontribs');
                    if (!loading) {
                        loading = true;
                        $.get(nexturl, function(data) {
                            var $html = $(data);
                            const $ul = $('.mw-contributions-list');
                            const $newul = $html.find('.mw-contributions-list > li');
                            $newul.each(function (index, element) {
                                $ul.append($(element));
                            });

                            nexturl = $html.find('a[rel="next"]').attr('href');

                            if (!nexturl) {
                                button.remove();
                            }
                            loading = false;
                        }).done(function() {
			    if (window.endlesscontribsExec && typeof window.endlesscontribsExec === 'function') {
				endlesscontribsExec();
			    }
			});
                    }
                });
            }
        });
    }
}(jQuery, mediaWiki ));
