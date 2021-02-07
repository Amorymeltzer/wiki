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

/********************************************************/

var actives = [];
var total = [], ordered = {};
var query3 = {
    action: 'query',
    format: 'json',
    prop: 'revisions',
    rvprop: 'content',
    formatversion: 2
};
query3.titles = actives.slice(0, 500).join('|');
var api3 = new Morebits.wiki.api('Get pages', query3, function(data){
    var isRE = /importScript\(['"](.+?\.js)['"]\)/g;
    var mlRE = /mw.loader.load\(['"].*[?&]title=(.+?\.js).*['"]\)/g;
    data.response.query.pages.forEach(function(page) {
	var content = page.revisions[0].content;
	// matchAll returns info about matching group
	var imports = Array.from(content.matchAll(isRE), m=>m[1]);
	var loaders = Array.from(content.matchAll(mlRE), m=>m[1]);
	if (imports.length) {
	    total = total.concat(imports);
	}
	if (loaders.length) {
	    total = total.concat(loaders);
	}
    });
});
api3.post();

var count = {};
total.forEach(function(item) {
    if (!count[item]) {
	count[item] = 1;
    } else {
	count[item]++;
    }
});
// Object sorted by key values
ordered = Object.fromEntries(Object.entries(count).sort(([,a],[,b]) => a<b));


/********************************************************/

var projQuery = {
    action: 'query',
    format: 'json',
    list: 'search',
    formatversion: '2',
    // srsearch: 'intitle:/\.js/ insource:/[\[ (=+,!]wg[A-Za-z]/',
    srsearch: 'contentmodel:javascript insource:/[\[ (=+,!]wg[A-Za-z]/',
    srnamespace: '4',
    srlimit: 'max',
    srprop: '',
    srsort: 'last_edit_desc'
};
var projRes = [];
var api4 = new Morebits.wiki.api('Get pages', projQuery, function(data){
    var search = data.response.query.search;
    search.forEach(function(title){
	title.title && projRes.push(title.title);
    });
});
api4.post();
