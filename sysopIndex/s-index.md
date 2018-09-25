The number of enWiki sysops has been in a steady decline for years.  It is a recurring topic of conversation at [[WT:RFA]] and elsewhere, it has been extensively covered at the Signpost, and many  causes and solutions have been offered and discussed.  The ''s''-index is a metric for assessing the activity of the entire corps of sysops.  It is analogous to the [[h-index|''h''-index]] for academics.

The [[h-index|''h''-index]] "{{tq|attempts to measure both the productivity and citation impact of the publications}}" of an academic, measuring the number of papers ''h'' with at least ''h'' citations.  An ''h''-index of five means the author has five papers that have been cited at least five times each, while an ''h''-index of 11 means the author has published 11 with at least 11 citations.  The intent of the ''h''-index is to measure both output and impact, not just quantity of either.  Note that moving from an ''h''-index of 11 to 12 requires publishing not just another paper, and not just having it cited 12 times, but also having 11 of your previous papers each citated at least once more.  A similar metric used in cycling is the [[Arthur Eddington#Eddington number for cycling|Eddington number]].

== What this page is ==
This page displays the ''s''-index, or sysop index, which measures ''s'', the number of sysops who took at least ''s'' administrator actions in a given period.  In essence, it treats enWiki as the scholar, with each sysop as a paper and the logged actions as each sysop's "citation" count.  The idea is to observe how the project's ''s''-index has changed and is changing over time, hopefully to provide some context.

== How this works ==
The [https://github.com/Amorymeltzer/wiki scripts] pull each month's data from [https://xtools.wmflabs.org/ XTools]' [https://xtools.wmflabs.org/adminstats/ AdminStats] and processes those values.  It then calculates the ''s''-index for the specified option, and creates a graph using [[R (programming language)|R]].  Below are a number of these graphs, each looking at a different range of data.  The monthly graphs show the ''s''-index for each month, while the annual graphs show the ''s''-index for each calendar year.  The rolling graphs show a rolling lookback for a specific number of months at a time, e.g. "rolling 3mos" shows the ''s''-index for the each three-month period available.  Each graph shows the ''s''-index both with and without bots, and a [[LOESS]] regression is also shown over the data.  An identical graph also exists for each that shows the total number of admin actions in that period.

== Graphs ==
=== Monthly ===

=== Rolling ===
==== 3 months ====
==== 6 months ====
==== 12 months ====

=== Annual ===


== Takeaways ==


== Caveats and drawbacks ==
* This relies on data from the AdminStats tool from XTools.  They are better at what they do than I am at what I do, so there's a good chance I'm wrong.
* AdminStats handles renames automatically, but I have to redownload the data if someone changes their name.  That's not too difficult, and I have a number of checks built-in to ensure the data is otherwise the same, but if a sysop, current or former, gets a rename, this may be out of date until I am aware of it.
* This calculates the index both including and excluding bots to show their effect, but still, bots.
* While potentially interesting, the ''h''-index itself is rather flawed, so this ''s''-index really doesn't actually mean anything and it certainly isn't clear what a "good" number would be.


graphs in columns
takeaways
future options?
* See todos
