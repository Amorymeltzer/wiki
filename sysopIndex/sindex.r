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
ggplot(dm, aes(x = month)) + 
  geom_line(aes_string(y = names(dm)[2]), group=1, colour = "blue") + 
  geom_line(aes_string(y = names(dm)[3]), group=1, colour = "black")

# Two lines by melting
library(reshape)
dm_melt = melt(dm, id = names(dm)[1])
head(dm_melt)

ggplot(dm_melt, aes(x = as.Date(month), y = value, colour = variable, group = variable)) + geom_line() + scale_x_date() +
  ylab(label="Number of new members") + 
  xlab("Week Number") + 
  scale_colour_manual(values=c("grey", "blue"))


par(opar)
