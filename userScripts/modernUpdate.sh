#!/usr/bin/env bash
# modernUpdate.sh by Amory Meltzer
# For security reasons, I only import specific revisions of user scripts into
# my modern.js, but if those scripts are subsequently updated it can be a pain
# to 1. know about it (beyond Special:WLH) and 2. update them.  This script
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
# just have perl be the main construct, then shim bash in there?  Really want
# icdiff for comparison though
LOADS=$(grep -io "mw\.loader\.load.*&oldid=.*&action=" $modern)
STRING=$(perl updateModernjs.pl $LOADS)
#STRING=$(echo -n "901004036:930753959 836240320:934625836 871454294:929485616 922407925:928306072")
echo $STRING
echo 'asd'
# readarray -td ',' FILES <<< "$STRING"
readarray -td ' ' FILES <<< "$STRING"
# FILES=$(echo $STRING | sed $'s/,/\\\n/g')
#FILES=$(echo -n $STRING | tr ',' '\n')
echo $FILES
for pair in "${FILES[@]}"; do
    old="${pair%%:*}"
    new="${pair##*:}"

    echo "$old-$new"
done
