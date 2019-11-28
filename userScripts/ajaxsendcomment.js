//Stolen from https://en.wikipedia.org/w/index.php?title=User:Splarka/ajaxsendcomment.js&oldid=299463884
//And https://en.wikipedia.org/w/index.php?title=User:Kangaroopower/ajaxMove.js&oldid=669103681
//Shorten p-cactions name, allow in all namespaces
//Click again to remove
//Check if user exists
//Better (well, any) warnings

$(function () {

    window.AjaxSendMsg = {
        version: '0.1',

        /* Create the pop-up form */
        createPopUpForm: function () {
            var popupHTML = '<div id="AjaxSendMsgUI"style="position: absolute; z-index: 9999999; left: 275px; top: 175px; width: 420px; height: 170px; background-color: white; padding: 3px; border-width: 1px; border-style: solid; border-color: #AAAAAA;  border-image: initial; overflow: visible; text-align: left; font-size: 10px;"><div><div style="width: 411px; border-bottom: 1px solid #aaaaaa; padding: 2px; font-weight: bold;">Send talkpage comment<span style="float:right"><a id="asc-close" href="#"><img src="//upload.wikimedia.org/wikipedia/commons/b/b6/Chrome_close_button.png"></a></span></div><div style="font-size: 11px; margin-left: 7px; margin-top: 8px; padding: 0px;">User name: <input id="asc-name" style="margin-left: 9px; font-size: 11px; width: 300px; "type="text" autofocus></div><div style="font-size: 11px; margin-left: 7px; margin-top: 8px; padding: 0px;">Section header: <input id="asc-section"style="margin-left: 9px; font-size: 11px; width: 300px;"type="text"></div><div style="font-size: 11px; margin-left: 7px; margin-top: 8px; padding: 0px;">Message text: <input id="asc-msg"style="margin-left: 9px; font-size: 11px; width: 300px;"type="text"></div><div style="font-size: 11px; margin-left: 7px; margin-top: 8px; padding: 0px;">Edit summary: <input id="asc-summ"style="margin-left: 9px; font-size: 11px; width: 300px;"type="text"></div><div style="margin-top: 8px; text-align:center; font-size: 11px; ">-- <a href="#"onclick="AjaxSendMsg.editPage();">Submit</a> --</div><div id="asc-error" style="margin-top: 5px;" ></div></div></div>';
            $('body').append(popupHTML);
            $('#asc-close').click(function () {
                $('#AjaxSendMsgUI').remove();
            });
            $('#AjaxSendMsgUI').draggable();
        },

        /* API functions */

        editPage: function () {
	$.ajax({
		url: mw.util.wikiScript( 'api' ),
		type: 'POST',
		dataType: 'json',
		data: {
			format: 'json',
			action: 'edit',
			title: 'User talk:'+encodeURIComponent($('#asc-name').val()),
			section: 'new',
			sectiontitle: $('#asc-section').val(),
			text: $('#asc-msg').val()+' ~~'+'~~',
			summary: $('#asc-summ').val(),
			watch: 'watch',
			token: mw.user.tokens.get( 'csrfToken' )
		}
	})
	.done (function( data ) {
		if ( data && data.edit && data.edit.result && data.edit.result == 'Success' ) {
			alert( 'Page edited!' );
		} else {
			alert( 'The edit query returned an error. =(' );
		}
	})
	.fail ( function() {
		alert( 'The ajax request failed.' );
	});
}
    };
    $(document).ready(function () {
            mw.util.addPortletLink('p-cactions', 'javascript:AjaxSendMsg.createPopUpForm();', "msg", "ca-msg", "Send someone a message");
    });
});