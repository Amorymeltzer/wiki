# Set working directory
setwd("~/Documents/perl/wiki/sysopIndex")

library(ggplot2)
library(reshape2)
library(RColorBrewer)
library(zoo)

# Import data
dm=read.csv("sindex.csv",header=T)
# Two lines by melting
dm_melt = melt(dm, id = names(dm)[1])
# Format dates, will be useful for scaling x-axis
dm_melt[[1]] <- as.Date(as.yearmon(dm_melt[[1]]))

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
    theme(legend.text = element_text(size=8,color=color.axis.title)) +
    theme(legend.title = element_blank()) +
    theme(legend.margin = margin(0,0,0,-5)) +
    
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
    
    # Plot margins
    theme(plot.margin = unit(c(0.35, 0.2, 0.3, 0.3), "cm"))
}

plot3 <- ggplot(dm_melt, aes_string(x = names(dm_melt[1]), y = names(dm_melt[3]), colour = names(dm_melt[2]), group = names(dm_melt[2]))) + geom_line() + scale_x_date(date_labels = "%b %y")+labs(title="Sysop index", x=names(dm_melt)[1], y="S-index")+modfte_theme()
plot3
