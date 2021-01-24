var names = ['User:Amory/test.js', 'User:EVula/test.js', 'User:Amorymeltzer/test.js', 'User:Amoryz/test.js'];

var filteredNames = [], newNames = [];
var query = {
	'action': 'query',
	'format': 'json',
	'list': 'usercontribs',
	'uclimit': '1',
	'ucdir': 'older',
	'ucprop': 'timestamp'
};
var sixMonths = new Date('2020-07-01').getTime();
names.forEach(function(script) {
    var split = script.split('/');
    query.ucuser = split[0];
    new mw.Api().get(query).then(function(data) {
	if (data.query && data.query.usercontribs && data.query.usercontribs.length) {
	    var user = data.query.usercontribs[0];
	    var ts = new Date(user.timestamp);
	    if (ts.getTime() <= sixMonths) {
		filteredNames.push(script);
	    } else {
		newNames.push(script);
	    }
	} else {
	    console.log(query.ucuser);
	};
    });
});
