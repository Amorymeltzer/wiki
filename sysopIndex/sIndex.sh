#!/usr/bin/env bash
# sIndex.sh by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Run everything
## Grab midnight (technically end of last month) or 1AM (start of this month)?


## run with options (will pass to calcH)
## getDates to array
### LOOP foreach in array
## curl file in bash to raw/
## md5 file > list
## checkData confirms timestamp in file
## table on file, save elsewhere and calculate m5d > list2
### ENDLOOP
## check list and list2 for duplicates with sort uniq
## call calch with options (calls sysophindex)
### Write calch dev
### Should grab all files in directory, sort by time, then process
## Should only replace latest when suessfully finished downloadin and processing
## Pretty print duplicates

function get_help {
    cat <<END_HELP
Usage: $(basename $0)
  -h		this help
END_HELP
}

while getopts 'hH' opt; do
    case $opt in
	h|H) get_help $0
	     exit 0;;
	\?) printf "Invalid option: -"$opt", try $0 -h\n" >&2
            exit 1;;
	:) printf "Option -"$opt" requires an argument, try $0 -h\n" >&2
           exit 1;;
    esac
done

# Simple error handling
function dienice() {
    echo "$1"
    exit 1
}

# url format, midnight of new month
urlStart='https://en.wikipedia.org/w/index.php?title=Special:Export&pages=User:JamesR/AdminStats&offset='
urlEnd='T00:59:00Z&limit=1&action=submit'
# Keep track of latest data grab
latest="latest"

if [[ -a "$latest" ]]; then
    latest=$(cat $latest)
else
    latest='';
fi

# All missing data
dates=$(perl getDates.pl "$latest") # NEED TO FIX THIS, NOT HANDLING INPUT RIGHT
if [ -z "$dates" ]; then
    dienice "No more dates to process!"
fi

# Directories
rawD="rawData"
csvD="csvData"
# URL basics
urlBase="https://en.wikipedia.org/w/index.php?title=Special:Export"
urlStart="&pages=User:JamesR/AdminStats&offset="
urlEnd="T00:00:02Z&limit=1&action=submit"
# Bulk download data monthly data from [[User:JamesR/AdminStats]]
for date in $dates
do
    raw=$rawD/$date
    echo "Downloading $date..."
    url="$urlBase$urlStart$date$urlEnd"
    curl -d '' "$url" -o $raw
    md5 -r $raw >> "md5raw.txt"

    timestamp=$(grep timestamp "$raw")

    perl checkData.pl $raw $timestamp
    # Die angrily if timestamps don't match
    if [ $? != 0 ]; then
	echo
	echo "WARNING: TIMESTAMP FOR $date seems erroneous!"
	exit
    fi

    csv=$csvD/$date."csv"
    perl table2csv.pl $raw > $csv
    md5 -r $csv >> "md5csv.txt"
done

rawDups=$(sort "md5raw.txt" | uniq -d)
csvDups=$(sort "md5csv.txt" | uniq -d)

if [[ -n $rawDups ]]; then
    echo "Duplicate raw data files found"
    for dup in $rawDups
    do
	echo $dup
    done
    echo $rawDups
    dienice "You should investigate manually"
fi

if [[ -n $csvDups ]]; then
    echo "Duplicate csv data files found"
    echo $csvDups
    dienice "You should investigate manually"
fi

# Rewrite calcH to take list of files, pass directory name from here
# https://stackoverflow.com/questions/1045792/how-can-i-list-all-of-the-files-in-a-directory-with-perl