#!/usr/bin/env bash
# readonly_shim by Amory Meltzer
# Check if the file system is read-only

grep -q "labstore-secondary-tools-project .... ro" /proc/mounts
