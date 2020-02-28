//Cribbed from [[User:Writ Keeper/Scripts/massRevdel.js]] at [[Special:PermaLink/861457321]]
if (mw.config.get("wgCanonicalSpecialPageName") == "AbuseLog" && (mw.util.getParamValue('wpSearchUser') || mw.util.getParamValue('wpSearchFilter') || mw.util.getParamValue('wpSearchTitle')))
{
    $("ul.plainlinks").before("<div style='display:inline-block;' id='suppressCP'><select id='wpRevDeleteReasonList'><option value='other'>Other reason</option></select><input name='wpReason' size='60' id='wpReason' maxlength='100'>\
 <input type='button' class='oversightSubmit' id='oversightSubmit' value='Prefill suppression links'></div>");
    $("ul.plainlinks").after("</form>");

    //load canned summaries
    $.get("/w/index.php?title=MediaWiki:Revdelete-reason-dropdown-suppress&action=raw",function(data)
	  {
	      reasons = data.replace(/\*\* ([^\*]+)/g, '<option value="$1">$1</option>');
	      reasons = reasons.replace(/\* ([^<]+)([^\*]+)/g, '<optgroup label="$1">$2</optgroup>');
	      $('#wpRevDeleteReasonList').append(reasons);
	  });

    //attach handlers
    $("#oversightSubmit").click(
	function()
	{
	    //construct the revdel summary
	    var summary = "";
	    if($("#wpRevDeleteReasonList").val() == "other")
	    {
		if($("#wpReason").val() == "")
		{
		    alert("You didn't select or write in an edit summary for the logs!");
		    return false;
		}
		summary = $("#wpReason").val();
	    }
	    else
	    {
		summary = $("#wpRevDeleteReasonList").val();
		if($("#wpReason").val() != "")
		{
		    summary = summary + ": " +  $("#wpReason").val();
		}
	    }

	    var links = $('.plainlinks li');
	    $.each(links, function(k, link) {
		link = $(link);
		var last = link.find('a')[link.find('a').length-1];
		$(last).attr('href', $(last).attr('href') + '&wphidden=1&wpreason=' + encodeURIComponent(summary));
	    });
	}
    );
}
