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
