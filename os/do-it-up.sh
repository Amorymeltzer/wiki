#!/usr/bin/env bash

wikitable="$HOME/Desktop/quarry-28169-g10-run*.wikitable"
# Keep $wikitable unquoted to keep globbing
if [ -f $wikitable ]; then
    target="g10.wikitable"
    mv $wikitable "$target"
    ./os.pl "$target"
    pbcopy <./"$target".out
    mv ./$target ./$target.out ~/.Trash/
else
    echo "No file found at $wikitable"
fi
