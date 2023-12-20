#!/usr/bin/env bash
# cron_shim.sh by Amory Meltzer
# Little shim to grep a file and exit if not found.  Basically, to rerun a
# command quickly if the last one failed

file=$1
search=$2
extra=$3

if [[ ! $(tail -n 1 "$file" | grep -e "$search" -e "$extra") ]]; then
    exit 1
fi
