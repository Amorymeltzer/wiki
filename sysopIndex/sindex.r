# Set working directory
setwd("~/Documents/perl/wiki/sysopIndex")

library(ggplot2)
library(reshape2)
library(RColorBrewer)
suppressPackageStartupMessages(library(zoo))
library(scales)

# Import data
args=commandArgs(trailingOnly = TRUE)
#args=c('sindex-monthly.csv','monthly')
#args=c('sindex-roll3.csv','rolling (3mos)')
dmt=read.csv(args[1],header=T)
# Format dates, useful for scaling x-axis
dmt[[1]] <- as.Date(as.yearmon(dmt[[1]]))
# Reorder for ggplot, make total-free
dmt <- dmt[,c(1,2,4,3,5)]
dm <- dmt[,c(1,2,3)]
# Format values, useful for scaling y-axis
dmt$Total = dmt$Total/1500
dmt$Total.bot = dmt$Total.bot/1500
# Two lines by melting
dm_melt = melt(dm, id = names(dm)[1])
dmt_melt = melt(dmt, id = names(dmt)[1])
# For line aesthetics?  Dash geom_smooth
#dm_melt$type <- ifelse(grepl("Total",dm_melt$variable), "total", "index")

# Theme modified from Max Woolf
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
    theme(legend.margin = margin(-5,0,-5,0)) +

    # Set title and axis labels
    theme(plot.title=element_text(size=10,color=color.title)) +
    theme(plot.title=element_text(hjust=0.5,face='bold')) +
    theme(plot.title=element_text(margin=margin(0,0,5,0,"pt"))) +
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
plot3 <- ggplot(dmt_melt, aes_string(x = names(dmt_melt[1]), y = names(dmt_melt[3]), colour = names(dmt_melt[2]), group = names(dmt_melt[2]))) + geom_line(aes(linetype=variable)) +
  scale_x_date(date_labels = "%b %y",breaks=pretty_breaks(6)) +
  scale_y_continuous(breaks=pretty_breaks(6)) +
  labs(title=paste("Sysop index",args[2], sep=' - '),
       x=names(dm_melt)[1],
       y="S-index",
       caption="User:Amorymeltzer") +
  scale_linetype_manual(values=c("solid", "solid", "dotted", "dashed")) +
  modfte_theme() + scale_colour_manual(values=c('#4DAF4A','#984EA3','grey75','grey75'))
#options(warn = -1)
#plot3 <- plot3+scale_y_continuous(sec.axis = sec_axis(~.*1500, name = "Total actions", breaks=derive(),labels=comma))
#options(warn = 0)
plot3+geom_smooth(se=FALSE, method=loess, size=0.75, show.legend=F)


buildPlot <- function(mf,tot)
{
  p<-ggplot(mf, aes_string(x = names(mf[1]), y = names(mf[3]), colour = names(mf[2]), group = names(mf[2]))) + geom_line(aes(linetype=variable)) +
    scale_x_date(date_labels = "%b %y",breaks=pretty_breaks(6)) +
    scale_y_continuous(breaks=pretty_breaks(6)) +
    labs(title=paste("Sysop index",args[2], sep=' - '),
         x=names(mf)[1],
         y="S-index",
         caption="User:Amorymeltzer") +
    scale_linetype_manual(values=c("solid", "solid", "dotted", "dashed")) +
    modfte_theme() + scale_colour_manual(values=c('#4DAF4A','#984EA3','grey75','grey75'))
  #options(warn = -1)
  #plot3 <- plot3+scale_y_continuous(sec.axis = sec_axis(~.*1500, name = "Total actions", breaks=derive(),labels=comma))
  #options(warn = 0)
#  p+geom_smooth(se=FALSE, method=loess, size=0.75, show.legend=F)
  ggsave(paste("S-index (",args[2],tot,").png", sep=''), p, width=4.92, height=3)
}
buildPlot(dm_melt,'')
buildPlot(dmt_melt,' - total')
#ggsave(paste("S-index (",args[2],").png", sep=''), plot3, width=4.92, height=3)
