// This page is used to define variables for the CSDHelper Script ([[User:Ale jrb/Scripts/csdhelper.js]])
// Heavily inspired by [[User:SoWhy/csdreasons.js]]

window.myDeclineReasons = [
	['G1', 'Not patent nonsense, is understandable'],
	['G1', 'Not patent nonsense, [[WP:CSD#G1|G1]] does not apply to poor writing, vandalism or hoaxes, coherent non-English material, or poorly translated material'],
	['G2', 'Not a test page'],
	['G2', 'G2 does not apply to userspace or the Wikipedia Sandbox'],
	['G3', 'Not blatant vandalism or hoax'],
	['G4', 'Only applies if the page was previously deleted as result of a [[WP:XFD|a deletion discussion]]'],
	['G4', 'The article is not substantially the same as the deleted version. A new [[WP:XFD|deletion discussion]] is required.'],
	['G5', '[[WP:CSD#G5|G5]] does not apply to pages created before the user was banned'],
	['G5', 'Page was not created in violation of the user\'s ban'],
	['G6', '[[WP:CSD#G6|G6]] does not apply to redirects left behind from routine pagemoves unless unambiguously made in error'],
	['G6', '[[WP:CSD#G6|G6]] does not apply to redirects as a result of routine pagemoves, and [[Special:Permalink/792132288#Draft Namespace Redirects|consensus]] is to keep Draft->Mainspace redirects'],
	['G6', 'Not uncontroversial maintenance/housekeeping'],
	['G6', 'You need to specify a reason why this should be considered uncontroversial maintenance'],
	['G6', 'Not an uncontroversial move, use [[WP:RM|requested moves]] instead'],
	['G7', 'Author has not requested deletion'],
	['G7', '[[WP:CSD#G7|G7]] does not apply to redirects from page moves unless you were the only editor of that page'],
	['G7', 'Other users have added substantial content'],
	['G8', 'Page exists'],
	['G10', 'Not a negative unsourced BLP blatantly intended to harass, attack, or libel its subject'],
	['G11', 'Not unambiguously promotional; may be able to be cleaned without a fundamental rewrite'],
	['G12', '[[WP:CSD#G12|G12]] can only be used when there is no non-infringing content on the page worth saving.'],
	['G13', 'Draft has non-bot edits within the last six months'],
	['G13', 'Page is not a draft'],
	['G13', '[[WP:CSD#G13|G13]] does not apply to redirects'],

	['A1', 'Article has sufficient context to identify its subject'],
	['A2', 'A2 requires the content to exist on another Wikimedia project'],
	['A3', 'Article has content beyond just external links, rephrasing of a title, or attempts to communicate with the subject'],
	['A3', 'An infobox is sufficient to pass [[WP:CSD#A3|A3]]'],
	['A3', '[[WP:CSD#A3|A3]] should not be used immediately after creation'],
	['A7', 'Article makes a credible assertion of importance or significance'],
	['A7', 'Article claims coverage in reliable sources'],
	['A7', 'Subject might be important/significant (see also Google News/Books hits for this subject) / use [[WP:PROD]] or [[WP:AFD]] instead to allow other editors to participate in this decision'],

	['A7', '----------'],

	['A7', 'A7 cannot be applied because of missing notability and/or references'],
	['A7', 'A7 explicitly excludes educational institutions'],
	['A7', 'A7 cannot be applied to books'],
	['A7', 'A7 cannot be applied to fictional characters or entities'],
	['A7', 'A7 cannot be applied to movies or TV shows'],
	['A7', 'A7 cannot be applied to products'],
	['A7', 'A7 cannot be applied to software'],
	['A7', 'A7 cannot be applied to towns or places'],

	['A7', '----------'],

	['A7', 'Being signed to a notable label indicates importance/significance ([[WP:CCSI#SINGER]], [[WP:CCSI#BAND]])'],
	['A7', 'Charting in national charts indicates importance/significance ([[WP:CCSI#SINGER]], [[WP:CCSI#BAND]])'],
	['A7', 'Performing at a notable event indicates importance/significance ([[WP:CCSI#SINGER]], [[WP:CCSI#BAND]])'],
	['A7', 'Winning a notable award indicates importance/significance ([[WP:CCSI#SINGER]], [[WP:CCSI#BAND]])'],
	['A7', 'Being or having been member of a notable band indicates importance/significance ([[WP:CCSI#SINGER]])'],
	['A7', 'Playing a non-extra role in a notable movie/TV show indicates importance/significance ([[WP:CCSI#ACTOR]])'],
	['A7', 'Being a writer for a notable newspaper indicates importance/significance ([[WP:CCSI#JOURNALIST]])'],
	['A7', 'Being CEO or other major figure of a notable company indicates importance/significance ([[WP:CCSI#BIZBIO]])'],
	['A7', 'Founding a notable company indicates importance/significance ([[WP:CCSI#BIZBIO]])'],
	['A7', 'Being the candidate of a major party for a notable office indicates importance/significance ([[WP:CCSI#POLITICIAN]])'],
	['A7', 'Holding a notable office or position indicates importance/significance ([[WP:CCSI#POLITICIAN]])'],
	['A7', 'Being professor at a notable university or college indicates importance/significance ([[WP:CCSI#ACADEMIC]])'],
	['A7', 'Being an expert in a notable field of study indicates importance/significance ([[WP:CCSI#ACADEMIC]])'],
	['A7', 'Playing for a notable team indicates importance/significance ([[WP:CCSI#ATHLETE]])'],
	['A7', 'Playing in a notable league indicates importance/significance ([[WP:CCSI#TEAM]])'],
	['A7', 'Having been founded by a notable person indicates importance/significance ([[WP:CCSI#CORP]], [[WP:CCSI#ORG]])'],

	['A7', '----------'],

	['A9', '[[WP:CSD#A9|A]]9 requires that the artist not have an article and that there are no claims of importance/significance regarding the musical recording itself'],
	['A10', 'Is not a recently created article that duplicates an existing topic without expanding on it'],
	['A10', '[[WP:CSD#A10|A10]] does not apply if the article title is a plausible redirect'],
	['A11', '[[WP:CSD#A11|A11]] only applies if the subject was invented by the article\'s creator or someone they know personally'],
	['A11', 'Article claims the invention to be significant/important'],
	['A11', 'Does not apply to hoaxes'],

	['R2', '[[WP:CSD#R2|R2]] only applies to redirects from Mainspace'],
	['R2', '[[WP:CSD#R2|R2]] does not apply to redirects to the Category, Template, Wikipedia, or Help namespaces'],
	['R3', '[[WP:CSD#R3|R3]] only applies to recently created and implausible redirects – use [[WP:RFD]] if you want deletion'],
	['R3', '[[WP:CSD#R3|R3]] does not apply to redirects from page moves unless that page was also recently created – use [[WP:RFD]] if you want deletion'],
	['R3', '[[WP:CSD#R3|R3]] does not apply to redirects from page moves unless that page was also recently created, and [[Special:Permalink/792132288#Draft Namespace Redirects|consensus]] is to keep Draft->Mainspace redirects'],
	['R4', '[[WP:CSD#R4|R4]] only applies to redirects that shadow a [[WP:Wikimedia Commons|Commons]] file or redirect – use [[WP:RFD]] if you want deletion'],
	['R4', '[[WP:CSD#R4|R4]] does not apply to redirects with any incoming [[Wikipedia:File link|links]]'],

	['U1', '[[WP:CSD#U1|U1]] does not apply to talk pages; user talk pages are [[WP:DELTALK|generally not deleted]]'],
	['U2', 'Not a user page of a nonexistent user'],
	['U5', 'Not a blatant misuse of Wikipedia as a web host'],
	['U5', 'User has made significant edits outside of user space'],

	['F1', 'File is used, or it is not a lower-quality version of an existing image'],
	['F2', 'File is neither corrupt, missing, or empty'],
	['F3', 'File has a suitable license'],
	['F4', 'File has the necessary licensing information'],
	['F5', 'File is used, or it has a free license'],
	['F6', 'File has a use rationale'],
	['F7', 'File has a valid fair-use claim'],
	['F8', 'File is not identical to the Commons version, or has been marked as "Keep local"'],
	['F9', 'Not an unambiguous copyright infringement'],
	['F10', 'File is not a useless non-media file'],
	['F11', 'Evidence of permission has been given'],

	['C1', 'Category is populated or is otherwise allowed to be empty']
];
