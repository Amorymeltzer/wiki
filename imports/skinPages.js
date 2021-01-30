var query = {
	action: 'query',
	format: 'json',
	list: 'search',
	formatversion: '2',
	srsearch: 'intitle:/vector.js|common.js|monobook.js|modern.js|timeless.js|cologneblue.js|minerva.js/ contentmodel:javascript insource:/[ (=+,!]wg[A-Za-z]/',
	srnamespace: '2',
	srlimit: 'max',
	srprop: '',
	srsort: 'last_edit_desc'
};
var res = [];
var api = new Morebits.wiki.api('Get pages', query, function(data){
	var search = data.response.query.search;
	search.forEach(function(title){
		title.title && res.push(title.title);
	});
});
api.post();

/********************************************************/

var skins = [];
skins = skins.filter(function(page) {
    return /common.js/i.test(page);
});

/********************************************************/

var pages = [];
var ret = [];
var query2 = {
	action: 'query',
	format: 'json',
	prop: 'info',
	inprop: '',
	formatversion: 2
};
query2.titles = pages.slice(0, 500).join('|');
var api2 = new Morebits.wiki.api('Get pages', query2, function(data){
    data.response.query.pages.forEach(function(page) {
	page.title && ret.push(page.title);
    });
});
api2.post();

var sorted = ret.sort(function(one, two){
    return new Date(one.timestamp).getTime() > new Date(two.timestamp).getTime() ? 1 : -1;
});
