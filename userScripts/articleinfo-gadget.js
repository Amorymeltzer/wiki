/**
 * This code was automatically generated and should not be manually edited.
 * For updates, please copy and paste from https://xtools.wmflabs.org/articleinfo-gadget.js?uglify=1
 * Released under GPL v3 license.
 * Local version of [[mw:XTools/ArticleInfo.js]]
 */
$(function(){if(mw.config.get("wgArticleId")===0||mw.config.get("wgCurRevisionId")!==mw.config.get("wgRevisionId")||mw.config.get("wgAction")!=="view"){return}var e="<div id='xtools' style='font-size:84%; line-height:1.2em;"+"width:auto;'><span id='xtools_result'>.</span></div>";$(e).insertBefore("#contentSub");var t=window.setInterval(function(){if($("#xtools_result").html()===".&nbsp;&nbsp;"){$("#xtools_result").html("&nbsp;.&nbsp;")}else if($("#xtools_result").html()==="&nbsp;.&nbsp;"){$("#xtools_result").html("&nbsp;&nbsp;.")}else{$("#xtools_result").html(".&nbsp;&nbsp;")}},300);$.get("https://xtools.wmflabs.org"+"/api/page/articleinfo/"+mw.config.get("wgServerName")+"/"+mw.config.get("wgPageName").replace(/["?%&+]/g,escape)+"?format=html"+"&uselang="+mw.config.get("wgUserLanguage")).done(function(e){$("#xtools_result").html(e);clearInterval(t)})});