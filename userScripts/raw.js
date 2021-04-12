// Adds a portlet link to js, css, and json pages to link to raw text
// Originally inspired by [[User:Kangaroopower/rawtab.js]]

if (['javascript', 'css', 'json'].indexOf(mw.config.get('wgPageContentModel')) !== -1) {
	mw.util.addPortletLink('p-cactions', '/w/index.php?title=' + mw.config.get('wgPageName') + '&action=raw&ctype=text/' + mw.config.get('wgPageContentModel'), 'Raw', 'ca-raw', 'Show raw js/css/json source');
}
