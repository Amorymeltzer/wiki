#!/usr/bin/env bash
# updateCommons.sh by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Open links to update files, should probably be improved

FILES=$(ls ./img/svg/)

for img in $FILES
do
    sha_loc=$(shasum ./img/svg/$img |cut -f 1 -d ' ')

    url_start='https://commons.wikimedia.org/w/api.php?action=query'
    url_mid='&format=json&prop=imageinfo&iiprop=sha1&titles=File%3A'
    url=$url_start$url_mid$img
    sha_web=$(curl -s $url|perl -pe 's/.*sha1":"(.*)"\}\].*/$1/;')

    if [ $sha_loc != $sha_web ]; then
	echo "$img needs updating, opening upload page"
	upload_start='https://commons.wikimedia.org/w/index.php?title=Special:Upload'
	upload_mid='&wpForReUpload=1&wpUploadDescription=Update with data from '
	upload_end=$(cat latest)'&wpDestFile='
	upload_extra='#mw-htmlform-description'
	upload=$upload_start$upload_mid$upload_end$img$upload_extra
	open $upload
    fi
done
