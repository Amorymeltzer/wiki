#!/usr/bin/env bash


mv ~/Desktop/quarry-*.wikitable g10.wikitable
./os.pl g10.wikitable
pbcopy <./g10.wikitable.out
mv ./g10* ~/.Trash/
