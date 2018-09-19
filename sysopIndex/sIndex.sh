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
Usage: $(basename $0) [-dp] <opt>

  opt		Processing option, either all or rollN (e.g., roll3).  Required with -p.
  -d		Downlaod data
  -p		Process data
  -h		This help
END_HELP
}

# Simple error handling
function dienice() {
    echo "$1"
    exit 1
}

function download_data() {
    # Keep track of latest data grab
    latest="latest"

    if [[ -a "$latest" ]]; then
	latest=$(cat $latest)
    else
	latest='initialize';
    fi

    # All missing data
    # Continue even if there is none, nothing will happen unless we messed up
    dates=$(perl getDates.pl "$latest")
    if [ -z "$dates" ]; then
	echo "No more dates to process!"
    fi

    # URL
    #/enWiki/2018-03-01/2018-03-31' -o 2018-03-01.2018-03-31.xtool
    urlBase="https://xtools.wmflabs.org/adminstats/enWiki/"

    # Bulk download data monthly data from [[User:JamesR/AdminStats]]
    for date in $dates
    do
	mon=$(echo ${date:0:7})
	raw=$rawD/$mon.'html'
	echo "Downloading $date..."
	url="$urlBase$date"
	echo $url
	curl -d '' "$url" -o $raw.tmp

	# Remove variable/easter egg content
	lines=$(wc -l $raw.tmp |xargs|cut -f 1 -d ' ')
	((lines -= 50))
	head -n $lines $raw.tmp > $raw
	rm $raw.tmp
	md5 -r $raw >> "md5raw.txt"

	timestamp=$(grep -A 2 "Ending date" $raw |tail -n 1|xargs)
	timestamp=$(echo ${timestamp:0:7})

	if [ "$timestamp" != "$mon" ]; then
	    dienice "Timestamp for $date seems erroneous"
	fi

	csv=$csvD/$mon.'csv'
	perl table2csv.pl $raw > $csv
	md5 -r $csv >> "md5csv.txt"
	echo -n $mon > latest
    done
    rawDups=$(sort "md5raw.txt" | uniq -d)
    csvDups=$(sort "md5csv.txt" | uniq -d)
    echo

    if [[ -n $rawDups ]]; then
	echo "Duplicate raw data files found"
	for dup in $rawDups
	do
	    echo $dup
	done
	dienice "You should investigate manually"
    fi

    if [[ -n $csvDups ]]; then
	echo "Duplicate csv data files found"
	for dup in $csvDups
	do
	    echo $dup
	done
	dienice "You should investigate manually"
    fi
}

function process_data() {
    # Rewrite calcH to take list of files, pass directory name from here
    # https://stackoverflow.com/questions/1045792/how-can-i-list-all-of-the-files-in-a-directory-with-perl
    perl calcH.pl $behav $sinFile $csvD/

    # Run Rscript
    Rscript sindex.r $sinFile "$rPass"
    rm Rplots.pdf			# Christ R is stupid
}

while getopts ':dDpPhH' opt; do
    case $opt in
	d|D) download='1';;
	p|P) process='1';;
	h|H) get_help $0
	     exit 0;;
	\?) printf "Invalid option: -"$opt", try $0 -h\n" >&2
            exit 1;;
	:) printf "Option -"$opt" requires an argument, try $0 -h\n" >&2
           exit 1;;
    esac
done

# Directories
rawD="rawData"
csvD="csvData"

if [[ -n $download ]]; then
    download_data
fi

if [[ -n $process ]]; then
    shift $((OPTIND -1))
    if [[ $1 =~ ^all$ ]]; then
	behav=$1
	sinFile='sindex-monthly.csv'
	rPass='monthly'
    elif [[ $1 =~ ^roll[0-9]+$ ]]; then
	behav=$1
	sinFile='sindex-'$1'.csv'
	tmp=$(echo ${behav:4})
	rPass='rolling ('$tmp'mos)'
    else
	get_help $0
	exit 0
    fi
    process_data
fi
