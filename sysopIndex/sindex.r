# Save settings for reverting
opar<-par()
# Set working directory
setwd("~/Documents/perl/wiki/sysopIndex")

library("ggplot2")

# Import data
dm=read.csv("sindex.csv",header=T)
#head(sindex)
#summary(sindex)
#names(sindex)

# Basic line plot with points
ggplot(data=dm, aes(x=month, y=sindex, group=1)) +
  geom_line()+
  geom_point()
# Change the line type
ggplot(data=dm, aes(x=month, y=sindex, group=1)) +
  geom_line(linetype = "dashed")+
  geom_point()
# Change the color
ggplot(data=dm, aes_string(x="month", y=names(dm)[3], group=1)) +
  geom_line(color="red")+
  geom_point()

# Two lines
ggplot(dm, aes(month)) + 
  geom_line(aes(y = sindex, colour = "sindex")) + 
  geom_line(aes(y = sindex.nobot, colour = "sindex.nobot"))

par(opar)