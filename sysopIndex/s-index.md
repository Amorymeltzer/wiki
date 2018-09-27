{{Nutshell|The ''s''-index (or sysop index) is an attempt to quantify sysop activity, where ''s'' is the number of sysops who took at least ''s'' administrator actions in a given period.  You probably want to look at the [[#Graphs|graphs]]}}

The number of enWiki sysops has been in a steady decline for years.  It is a recurring topic of conversation at [[WT:RFA]], a common thread of [[Wikipedia:RFA reform|RfA reform proposals]], and has been extensively covered at the [[Wikipedia:Wikipedia Signpost/Templates/Admin series|Signpost]] and elsewhere.  Many causes and solutions have been offered and discussed.  The ''s''-index is a metric for assessing the activity of the entire corps of sysops.  It is analogous to the [[h-index|''h''-index]] for academics, which "{{tq|attempts to measure both the productivity and citation impact of the publications}}" of an academic, measuring the number of papers ''h'' with at least ''h'' citations.  An ''h''-index of five means the author has five papers that have been cited at least five times each, while an ''h''-index of 11 means the author has published 11 with at least 11 citations.  The intent of the ''h''-index is to measure both output and impact, not just quantity of either.  Note that moving from an ''h''-index of 11 to 12 requires publishing not just another paper, and not just having it cited 12 times, but also having 11 of your previous papers each citated at least once more.  In essence, the ''s''-index treats enWiki as the scholar, with each sysop as a paper and the logged actions as each sysop's "citation" count.  A similar metric used in cycling is the [[Arthur Eddington#Eddington number for cycling|Eddington number]].

The [https://github.com/Amorymeltzer/wiki/tree/master/sysopIndex code] for this project pulls each month's data from [https://xtools.wmflabs.org/ XTools'] [https://xtools.wmflabs.org/adminstats/ AdminStats] and processes those values.  It then calculates the ''s''-index for the specified option, and graphs it using [[R (programming language)|R]].  The idea is to observe how the project's ''s''-index has changed and is changing over time, hopefully to provide some context.  Below are a number of these graphs, each looking at a different range of data.  The monthly graphs show the ''s''-index for each month, while the annual graphs show the ''s''-index for each calendar year.  The rolling graphs show a rolling lookback for a specific number of months at a time, e.g. "rolling 3mos" shows the ''s''-index for the each three-month period available.  Each graph shows the ''s''-index both with and without bots, and a [[LOESS]] regression is also shown over the data.  An identical graph also exists for each that shows the total number of admin actions in that period.

== Graphs ==
=== Monthly ===
{{Col-begin}}
{{Col-break}}
[[File:S-index_monthly.svg]]
{{Col-break}}
[[File:S-index_monthly_(total).svg]]
{{Col-end}}

=== Rolling ===
==== 3 months ====
{{Col-begin}}
{{Col-break}}
[[File:S-index_rolling-3mos.svg]]
{{Col-break}}
[[File:S-index_rolling-3mos_(total).svg]]
{{Col-end}}

==== 6 months ====
{{Col-begin}}
{{Col-break}}
[[File:S-index_rolling-6mos.svg]]
{{Col-break}}
[[File:S-index_rolling-6mos_(total).svg]]
{{Col-end}}

==== 12 months ====
{{Col-begin}}
{{Col-break}}
[[File:S-index_rolling-12mos.svg]]
{{Col-break}}
[[File:S-index_rolling-12mos_(total).svg]]
{{Col-end}}

=== Annual ===
{{Col-begin}}
{{Col-break}}
[[File:S-index_annual.svg]]
{{Col-break}}
[[File:S-index_annual_(total).svg]]
{{Col-end}}

== Takeaways ==
* The monthly ''s''-index charts make sense in the broader picture of [[User:Widefox/editors|sysop activity]], in particular the peak in the late 2000s.
* The project hit a low point, both in ''s''-index and actions around 2014; the ''s''-index has slowly crept up since then.
* Since then, bots have become an increasingly important source of admin actions.  Nonbot actions have slowly increased and are at roughly 2006 levels while total actions (including bots) have increased rapidly and will likely reach a record level soon.
** Most recent sysopbot actions are from just two bots ([[User:ProcseeBot]] and [[User:RonBot]]), which is why the ''s''-index is comparatively unchanged.

== Caveats and drawbacks ==
* The ''h''-index itself is rather flawed, so while potentially interesting this ''s''-index really doesn't actually mean anything and it certainly isn't clear what a "good" number would be.
* This relies on data from the AdminStats tool from XTools.
** AdminStats includes (re)(un)blocks, (un)deletions (including revdels), (re)(un)protections, user rights changes, and imports.  Anything else (edit filter changes, renames, merges, massmessages) isn't counted as a sysop action.
** AdminStats includes ''only'' the above logged items, so other typical sysop activities, such as closing deletion discussions, are not counted.  This is a common issue with sysop-related metrics.
** AdminStats handles renames automatically, but I have to redownload the data if someone changes their name.  That's not too difficult, and I have built in a number of checks to ensure the data is otherwise unchanged, so this may be ever-so-slightly out of date until I am aware of a sysop rename.
** They are better at what they do than I am at what I do, so there's a good chance I'm wrong about something.
* The data include some users who are not sysops, in particular WMF staff member accounts, that nonetheless have taken sysop actions.  These occasionally affect the ''s''-index, but it is rare and only ever changes it by a single point, so they are left in.
* This calculates the index both including and excluding bots to show their effect, but still, bots.
* Data begin January 2005, as that is the first full month with logs.

[[Category:Wikipedia adminship]]
[[Category:Wikipedia administrator statistics]]
[[Category:Matters related to requests for adminship]]
{{DISPLAYTITLE:User:Amorymeltzer/''s''-index}}
