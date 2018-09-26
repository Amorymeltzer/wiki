The number of enWiki sysops has been in a steady decline for years.  It is a recurring topic of conversation at [[WT:RFA]] and elsewhere, it has been extensively covered at the Signpost, and many  causes and solutions have been offered and discussed.  The ''s''-index is a metric for assessing the activity of the entire corps of sysops.  It is analogous to the [[h-index|''h''-index]] for academics.

The [[h-index|''h''-index]] "{{tq|attempts to measure both the productivity and citation impact of the publications}}" of an academic, measuring the number of papers ''h'' with at least ''h'' citations.  An ''h''-index of five means the author has five papers that have been cited at least five times each, while an ''h''-index of 11 means the author has published 11 with at least 11 citations.  The intent of the ''h''-index is to measure both output and impact, not just quantity of either.  Note that moving from an ''h''-index of 11 to 12 requires publishing not just another paper, and not just having it cited 12 times, but also having 11 of your previous papers each citated at least once more.  A similar metric used in cycling is the [[Arthur Eddington#Eddington number for cycling|Eddington number]].

== What this page is ==
This page displays the ''s''-index, or sysop index, which measures ''s'', the number of sysops who took at least ''s'' administrator actions in a given period.  In essence, it treats enWiki as the scholar, with each sysop as a paper and the logged actions as each sysop's "citation" count.  The idea is to observe how the project's ''s''-index has changed and is changing over time, hopefully to provide some context.

== How this works ==
The [https://github.com/Amorymeltzer/wiki scripts] pull each month's data from [https://xtools.wmflabs.org/ XTools]' [https://xtools.wmflabs.org/adminstats/ AdminStats] and processes those values.  It then calculates the ''s''-index for the specified option, and creates a graph using [[R (programming language)|R]].  Below are a number of these graphs, each looking at a different range of data.  The monthly graphs show the ''s''-index for each month, while the annual graphs show the ''s''-index for each calendar year.  The rolling graphs show a rolling lookback for a specific number of months at a time, e.g. "rolling 3mos" shows the ''s''-index for the each three-month period available.  Each graph shows the ''s''-index both with and without bots, and a [[LOESS]] regression is also shown over the data.  An identical graph also exists for each that shows the total number of admin actions in that period.

== Graphs ==
=== Monthly ===
<gallery>
</gallery>

=== Rolling ===
==== 3 months ====
<gallery>
File:S-index-rolling 3mos.svg
File:S-index-rolling 3mos (total).svg
</gallery>

==== 6 months ====
<gallery>
File:S-index-rolling 6mos.svg
File:S-index-rolling 6mos (total).svg
</gallery>

==== 12 months ====
<gallery>
File:S-index-rolling 12mos.svg
File:S-index-rolling 12mos (total).svg
</gallery>

=== Annual ===
<gallery>
File:S-index-annual.svg
File:S-index-annual (total).svg
</gallery>

== Takeaways ==
* The monthly ''s''-index charts make sense in the broader picture of [[User:Widefox/editors|sysop activity]], in particular the peak in the late 2000s.
* The project hit a low point, both in ''s''-index and actions around 2014; the ''s''-index has slowly crept up since then.
* Since then, bots have become an increasingly important source of admin actions.  Nonbot actions have slowly increased and are at roughly 2006 levels while total actions (including bots) have increased rapidly and will likely reach a record level soon.
** Most of the recent sysopbot actions are from just two bots ([[User:ProcseeBot]] and [[User:RonBot]]), which is why the ''s''-index is comparatively unchanged.


== Caveats and drawbacks ==
* While potentially interesting, the ''h''-index itself is rather flawed, so this ''s''-index really doesn't actually mean anything and it certainly isn't clear what a "good" number would be.
* This relies on data from the AdminStats tool from XTools.
** AdminStats includes (re)(un)blocks, (un)deletions (including revdels), (re)(un)protections, user rights changes, and imports.  Anything else (edit filter changes, renames, merges, massmessages) isn't counted as a sysop action.
** Likewise, AdminStats includes ''only'' logged items, so other sysop activities, such as closing deletion discussions, are not counted.
** AdminStats handles renames automatically, but I have to redownload the data if someone changes their name.  That's not too difficult, and I have built in a number of checks to ensure the data is otherwise unchanged, but if a sysop, current or former, gets a rename, this may be ever-so-slightly out of date until I am aware of it.
** They are better at what they do than I am at what I do, so there's a good chance I'm wrong about something.
* This calculates the index both including and excluding bots to show their effect, but still, bots.
* Data begin January 2005, as that is the first full month with logs.

[[Category:Wikipedia adminship]]
[[Category:Wikipedia administrator statistics]]
[[Category:Matters related to requests for adminship]]


graphs in columns
takeaways
future options?
* See todos
Feedback welcome (takeaways, colors, options, etc.)
