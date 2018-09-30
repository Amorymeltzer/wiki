### Calculating the *s*-index
![Monthly total](img/png/S-index_monthly_(total).png)

Despite the many scripts here, this is pretty easy to use: just run `sIndex.sh` with your desired option and it will take care of everything for you.  The `-p` and `-r` flags should be most relevant, as they process the data and create the relevant graphs, respectively.  With either or both of these options, you must specify desired your calculation method.

Supported options:
* `month` - Calculate/graph the *s*-index for each month available
* `rollN` - Rolling *s*-index for the last N months, e.g. `roll3` for three months at a time
* `year` - *s*-index for each calendar year (2005, 2006, etc.)
* `fixedN` - fixed *s*-index for chunks of N months, e.g. `fixed6` for six month periods

Graphs (both png and svg) can be found in [the img directory](./img) and include *s*-indices both with and without bots.  One graph also includes total admin actions for each period.  Rolling data is graphed according to final date, while fixed data is graphed according to starting date.
