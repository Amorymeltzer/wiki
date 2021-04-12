#!/usr/bin/env bash
# cron_shim.sh by Amory Meltzer
# Little shim for cron to grep a file and exit if not found
# Basically, to make cron rerun a command quickly if the last one failed

file=$1
search=$2

if [[ ! $(tail -n 1 "$file" | grep "$search") ]]; then
    exit 1
fi
