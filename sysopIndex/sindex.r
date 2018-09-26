# sindex.r by Amory Meltzer
# Licensed under the WTFPL http://www.wtfpl.net/
# Generate s-index graphs

# Set working directory
setwd("~/Documents/perl/wiki/sysopIndex")

library(ggplot2)
library(reshape2)
library(RColorBrewer)
suppressPackageStartupMessages(library(zoo))
library(scales)

args=commandArgs(trailingOnly = TRUE)
#args=c('sindex-monthly.csv','monthly')
#args=c('sindex-roll3.csv','rolling (3mos)')
# Import data
dmt=read.csv(args[1],header=T)
# Format dates, useful for scaling x-axis
dmt[[1]] <- as.Date(as.yearmon(dmt[[1]]))
# Reorder for ggplot, make total-free
dmt <- dmt[,c(1,2,4,3,5)]
dm <- dmt[,c(1,2,3)]
# Adjust totals to be similar on y-axis scale
factor = round(.9*max(dmt$Total)/max(dmt$s.index),-1)
dmt$Total = dmt$Total/factor
dmt$Total.nobot = dmt$Total.nobot/factor
# Two lines by melting
dm_melt = melt(dm, id = names(dm)[1])
dmt_melt = melt(dmt, id = names(dmt)[1])
# Determine correct format
if (args[2]=='annual') {
  dform='%Y'
} else {
  dform='%b %y'
}
# Format titles
titlePart=gsub("[\\(\\)]","",args[2])

# Might help for creating separate legends?
#dmt_melt$type <- ifelse(grepl("Total",dmt_melt$variable), "total", "index")

# fte theme modified from Max Woolf
# https://minimaxir.com/2015/02/ggplot-tutorial/
modfte_theme <- function() {
  # Generate colors with RColorBrewer
  palette <- brewer.pal("Greys", n=9)
  color.background = '#F8F8F8'
  color.grid.major = palette[5]
  color.axis.text = palette[8]
  color.axis.title = palette[8]
  color.title = palette[9]
  
  # Begin construction of chart
  theme_bw(base_size=8) +
    
    # Set the entire chart region to a light gray color
    theme(panel.background=element_rect(fill=color.background, color=color.background)) +
    theme(plot.background=element_rect(fill=color.background, color=color.background)) +
    theme(panel.border=element_rect(color=color.background)) +
    
    # Hide minor and ticks
    theme(panel.grid.major=element_line(color=color.grid.major,size=0.3)) +
    theme(panel.grid.minor=element_blank()) +
    theme(axis.ticks=element_blank()) +
    
    # Match legend to background
    theme(legend.background = element_rect(fill=color.background)) +
    theme(legend.key = element_rect(fill=color.background)) +
    theme(legend.text = element_text(size=7,color=color.axis.title)) +
    theme(legend.title = element_blank()) +
    theme(legend.position = 'top') +
    #theme(legend.justification=c(0,1)) +
    theme(legend.margin = margin(-5,0,-5,0)) +
    
    # Stupid way to get tag in desired place
    theme(plot.tag.position = 'top') +
    theme(plot.tag = element_text(vjust=-10,color=color.axis.title,size=4)) +
    theme(plot.tag = element_text(margin=margin(-6,0,0,125,"pt"))) +
    
    # Set title and axis labels
    theme(plot.title=element_text(size=10,color=color.title)) +
    theme(plot.title=element_text(hjust=0.5,face='bold')) +
    #theme(plot.title=element_text(face='bold')) +
    theme(plot.title=element_text(margin=margin(0,0,5,0,"pt"))) +
    #theme(plot.subtitle=element_text(size=6,hjust=0.5,vjust=-5)) +
    theme(axis.text.x=element_text(size=8,color=color.axis.text)) +
    theme(axis.text.y=element_text(size=8,color=color.axis.text)) +
    theme(axis.title.x=element_text(size=9,color=color.axis.title, vjust=0)) +
    theme(axis.title.y=element_text(size=9,color=color.axis.title, vjust=0.5)) +
    #theme(axis.text.x = element_text(margin=margin(0,0,0,0,"pt"))) +
    #theme(axis.text.y = element_text(margin=margin(5,5,10,5,"pt"))) +
    theme(plot.caption = element_text(size=6, color=palette[6])) +
    
    # Plot margins
    theme(plot.margin = unit(c(0.35, 0.2, 0.3, 0.3), "cm"))
}
# plot3 <- ggplot(dmt_melt, aes_string(x = names(dmt_melt[1]), y = names(dmt_melt[3]), colour = names(dmt_melt[2]), group = names(dmt_melt[2]))) + geom_line()+
#   scale_x_date(date_labels = dform,breaks=pretty_breaks(6)) +
#   scale_y_continuous(breaks=pretty_breaks(6)) +
#   labs(title=paste("Sysop index",args[2], sep=' - '),
#        x=names(dm_melt)[1],
#        y=expression(italic("s")~-index),
#        tag=paste('totals x',factor, sep=''),
#        caption="User:Amorymeltzer") +
#   modfte_theme() + scale_colour_brewer(palette='Set1')
# options(warn = -1)
# plot3 <- plot3+scale_y_continuous(sec.axis = sec_axis(~.*1500, name = "Total actions", breaks=derive(),labels=comma))
# options(warn = 0)
# plot3<-plot3+geom_smooth(se=FALSE, method=loess, size=0.3, linetype='dashed')
# plot3
# ggsave(paste("img.png", sep=''), plot3, width=4.92, height=3)

buildPlot <- function(mf, tot, fact)
{
  p<-ggplot(mf, aes_string(x = names(mf[1]), y = names(mf[3]), colour = names(mf[2]), group = names(mf[2]))) + geom_line() +
    scale_x_date(date_labels = dform,breaks=pretty_breaks(6)) +
    scale_y_continuous(breaks=pretty_breaks(6)) +
    labs(title=paste("Sysop index",args[2], sep=' - '),
         x=names(mf)[1],
         y=expression(italic("s")~-index),
         caption="User:Amorymeltzer") +
    modfte_theme() + scale_colour_brewer(palette='Set1')

  p<-p+geom_smooth(se=FALSE, method=loess, size=0.3, linetype='dashed')
  if (fact != '') {
    p<-p+labs(tag=paste('totals x',factor, sep=''))
  }

  ggsave(paste("img/S-index-",titlePart,tot,".png", sep=''), p, width=4.92, height=3)
}
buildPlot(dm_melt, '', '')
buildPlot(dmt_melt, ' (total)', factor)