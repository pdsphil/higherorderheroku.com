---
title: The Theory of Constraints - Part I
date: August 21, 2015
---

## Introduction
It doesn't take a huge leap of imagination to draw an analogy between a factory and a web application.  We use terms like processes and workers which have an almost identical analog in manufacturing.  Thus terms like productivity, throughput, latency, setup time etc are applicable to both manufacturing and optimizing web applications.  If you haven't read it, Eliyahu Goldratt’s book, [The Goal](http://www.amazon.com/The-Goal-Process-Ongoing-Improvement/dp/0884271951) is an excellent primer on what is called the Theory of Constraints.  The Theory of constraints is defined [here.](https://en.wikipedia.org/wiki/Theory_of_constraints) This series of articles will borrow heavily on his work but my goal (no pun intended here) will be to cast these concepts into the realm of computer science as to make them relevant in context.  Though I’m thinking specifically in terms of the Heroku platform as I put these articles together, the concepts are general enough to be applicable to any cloud platform and in fact, to even more traditional “bare metal” infrastructures.

## The Goal
In his book, Goldratt proposes that each factory have a goal.  For his fictional factory, the stated goal was “making money”.  The same could be proposed for a web application, but for purposes of normalizing the optimization factors, I feel like it would cause an impedance in our model.  We don’t deal with financial details like capital investment, inventory, holding costs and things like that.  Picking a stated goal isn’t as obvious as money in a web app context either, though money may act as a proxy measurement in certain circumstances.  One goal I hear consistently is “sub second response time”.  This is a noble goal but what if your system is optimized monetarily when it processes more transactions.  Granted this might be a contrived example but what if you could perform 10% more transactions if you lowered your end user response time by 15%?  The point here is not to get one dimensional on your goal.  Think about what it means to the business if different things were the stated goal.  This might mean turning things upside down a bit but it can really pay to consider this carefully.

## The Next Installment
Next time we’ll concentrate on “building the factory’.  Of course this will be in the context of the Heroku platform.  In this installment I’ll lay out the “machines” or resources that will be used in our model and we’ll talk a bit about how those assets are put to good use within the context of our stated goal.


