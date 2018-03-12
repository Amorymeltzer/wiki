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
## cehck list and list2 for duplicates with sort uniq
## call calch with options (cals sysophindex)

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
dates=$(perl getDates.pl "$latest")
if [ -z "$dates" ]; then
    dienice "No more dates to process!"
fi

urlBase="https://en.wikipedia.org/w/index.php?title=Special:Export"
urlStart="&pages=User:JamesR/AdminStats&offset="
urlEnd="T00:00:02Z&limit=1&action=submit"
# Bulk download data monthly data from [[User:JamesR/AdminStats]]
for date in $dates
do
    url="$urlBase$urlStart$date$urlEnd"
    curl -d '' "$url" -o $date
    md5 -r $date >> "md5raw.txt"

    timestamp=$(grep timestamp "$date")

    perl checkData.pl $date $timestamp
    # Die angrily if timestamps don't match
    if [ $? != 0 ]; then
	echo
	echo "WARNING: TIMESTAMP FOR $date seems erroneous!"
	exit
    else
	echo
    fi

    process=$date."csv"
    perl table2csv.pl $date > $process
    md5 -r $process >> "md5process.txt"
done

rawDups=$(sort "md5raw.txt" | uniq -d)
processDups=$(sort "md5process.txt" | uniq -d)

if [[ -n $rawDups ]]; then
    echo "Duplicates raw data files found"
    echo $rawDups
fi

if [[ -n $processDups ]]; then
    echo "Duplicates raw data files found"
    echo $rawDups
fi
