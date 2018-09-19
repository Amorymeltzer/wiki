#!/usr/bin/env bash
# sIndex.sh by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Run everything

function get_help {
    cat <<END_HELP
Usage: $(basename $0) [-dp] <opt>

  opt		Calculating option, either all or rollN (e.g., roll3).  Required with -p.
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
    urlBase="https://xtools.wmflabs.org/adminstats/enWiki/"
    # Keep track of latest data grab
    latest="latest"

    if [[ -a "$latest" ]]; then
	latest=$(cat $latest)
    else
	latest='initialize';
    fi

    # All missing data
    # Continue even if there are none, nothing will happen unless we messed up
    dates=$(perl getDates.pl "$latest")
    if [ -z "$dates" ]; then
	echo "No more dates to process!"
    fi

    # Bulk download monthly data from https://xtools.wmflabs.org/adminstats
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

	# Verify date as expected, not likely to be a problem
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

    # Check data for duplication events
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
	rPass=$(echo ${behav:4})
	rPass='rolling ('$rPass'mos)'
    else
	get_help $0
	exit 0
    fi
    process_data
fi
