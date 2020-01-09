#!/usr/bin/env bash
# modernUpdate.sh by Amory Meltzer
# For security reasons, I only import specific revisions of user scripts into
# my modern.js, but if those scripts are subsequently updated it can be a pain
# to 1. know about it (beyond Special:WLH) and 2. update them.  This scripts
# checks each import, presents a diff for me to visually inspect, and prompts
# for confirmation for each item.


modern='modern.js'
# Ensure modern.js actually exists
if [[ ! -a "$modern" ]]; then
    echo "$modern does not exist!"
    exit 1
fi

# Process all relevant mw.loader.load urls, ignoring externals in "safe"
# places that don't use the oldid format, send off to perl
# Done this way to avoid having perl log in multiple times.  Maybe better to
# just have perl be the main construct, then shim bash in there?
LOADS=$(grep -io "mw\.loader\.load.*&oldid=.*&action=" $modern)
perl updateModernjs.pl $LOADS
for url in $LOADS
do
    title=$(echo $url | perl -pe 's/.*title=(.*)&oldid=.*/$1/;')
    oldid=$(echo $url | perl -pe 's/.*oldid=(.*)&action=.*/$1/;')
done
