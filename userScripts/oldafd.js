/* AFD age detector, version [0.0.3]
Originally from: http://en.wikipedia.org/wiki/User:Splarka/oldafd.js
https://en.wikipedia.org/w/index.php?title=User:Splarka/oldafd.js&oldid=318627702

Updated 2018-04
- Updated code
- Display gray text until three hours before close
- Use contentSub instead of body for pink notice
*/

if(mw.config.get("wgCurRevisionId") != 0 && mw.config.get("wgNamespaceNumber") == 4 && (mw.config.get("wgPageName").indexOf('_for_deletion/') != -1 || mw.config.get("wgPageName").indexOf('_for_discussion/') != -1)) $(function () {
  var url = mw.config.get("wgScriptPath") + '/api.php?maxage=3600&smaxage=3600&action=query&indexpageids&prop=revisions&rvdir=newer&rvlimit=1&rvprop=timestamp|comment|user&format=json&callback=ageCheckAFDCB&pageids=' + mw.config.get("wgArticleId");
  importScriptURI(url);
});

function ageCheckAFDCB(obj) {
  var sub = document.getElementById('contentSub') || document.getElementById('topbar');
  var div = document.createElement('div');
  sub.appendChild(div);
  if(!obj['query'] || !obj['query']['pages'] || obj['query']['pages'].length == 0 || !obj['query']['pageids'] || obj['query']['pageids'].length == 0 || obj['error']) {
    div.appendChild(document.createTextNode('Api error in AFD Age Detector.'));
    return;
  }
  var id = obj['query']['pageids'][0];
  var page = obj['query']['pages'][id];
  var rev = page['revisions'][0];
  if(!rev || !rev['timestamp'] || !rev['user']) return

  var now = new Date();
  var tsd = new Date();
  tsd.setISO8601(rev['timestamp']);
  var timesince = Math.floor((now - tsd)/1000);
  if(timesince == '') timesince = -1
  var revinfo = 'Page created: ' + duration(timesince) + ' ago by ' + rev['user'];
  if(rev['comment']) div.setAttribute('title',rev['comment'])
  if(!rev['comment'] || rev['comment'].indexOf('Created') == -1) div.style.color = '#666666'
  if(timesince > 594000) div.style.color = '#ff0000'
  div.appendChild(document.createTextNode(revinfo + '.'));
  if(timesince > 604800) mw.util.addCSS('#contentSub {background:#ffaaff !important;}')
}

function duration(input,depth) {
  var num = input;
  var out = '';
  var s = num % 60; num = Math.floor(num / 60);
  var m = num % 60; num = Math.floor(num / 60);
  var h = num % 24; num = Math.floor(num / 24);
  var d = num % 7;  num = Math.floor(num / 7);
  var w = num % 52; num = Math.floor(num / 52);
  var y = num
  if(y > 0) out += y + 'yrs '
  if(y + w > 0) out += w + 'wks '
  if(y + w + d > 0) out += d + 'days '
  if(y + w + d + h > 0) out += h + 'hrs '
  if(y + w + d + h + m > 0) out += m + 'mins '
  out += s + 'secs';  
  if(depth && depth < out.split(' ').length) {
    out = out.split(' ').slice(0,depth).join(' ');
  }
  return out;
}

//ISO 8601 date module by Paul Sowden, licensed under AFL.
Date.prototype.setISO8601 = function(string) {
  if(!string) return
  var regexp = '([0-9]{4})(-([0-9]{2})(-([0-9]{2})(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?';
  var d = string.match(new RegExp(regexp));
  if(d.length < 1) return
  var offset = 0;
  var date = new Date(d[1], 0, 1);
  if(d[3]) date.setMonth(d[3] - 1)
  if(d[5]) date.setDate(d[5])
  if(d[7]) date.setHours(d[7])
  if(d[8]) date.setMinutes(d[8])
  if(d[10]) date.setSeconds(d[10])
  if(d[12]) date.setMilliseconds(Number('0.' + d[12]) * 1000)
  if(d[14]) {
    offset = (Number(d[16]) * 60) + Number(d[17]);
    offset *= ((d[15] == '-') ? 1 : -1);
  }
  offset -= date.getTimezoneOffset();
  time = (Number(date) + (offset * 60 * 1000));
  this.setTime(Number(time));
}