---
title: Handling App Instability with Circuit-breakers
date: July 10, 2015
---

## The Problem
As a Customer Solutions Architect for [Heroku](http://heroku.com), I get asked a lot of questions about third party up-time.  "How many 9's do they support?  How are we notified of maintenance windows?  How do we get notified when a service becomes unavailable?" are all very common questions.  I understand what motivates these questions and the motivation is just, however the answers and reality are often two very different animals.  Like car manufacturers have been saying for years: "Your mileage may vary", so too are the guarantees made by external service providers.

While these questions and concerns are prudent, the truth is that we never really know what to expect from the services on which our applications depend and as such we should live near and dear to the motto "Hope for the best but plan for the worst."  Just in case you need reminding, everything fails at some point or another and as such, it is incumbent on us as architects and designers to plan accordingly.  This can be really, really challenging but we need to address it somehow whether it be in the form of a gracefully failing application "We're sorry, but we'll be back latter" or you support degraded service on your site.  In either case, the dreaded "500" or similar server fault error is just not acceptable.

## An Architectural Approach, Circuit-breakers
Anybody familiar with electronics or electrical systems is well aware of the ubiquitous circuit-breaker.  It's operation is simple.  If there's too much current, the circuit-breaker trips which then relieves the pressure on the system effectively preventing a fire or something equally bad.  While the software analogy isn't exactly this, the idea is the same.  If a service is down, your application will happily pound on the dead service disparately trying to get an answer to no avail.  Requests queue, things start to time out, response becomes sluggish and eventually you have a big fat mess on your hands.  Wouldn't it be nice if system degradation could be managed and graceful?  This circuit-breaker pattern has been around for a while, but I'm surprised how infrequently I see it.  [Martin Fowler does a good job documenting this patter here.](http://martinfowler.com/bliki/CircuitBreaker.html)

## An implementation in Ruby
One of my Heroku colleagues, [Pedro Belo](https://gist.github.com/pedro) has put together a handy gem that implements this pattern.  [That Gem can be found here.](https://github.com/pedro/cb2) and [a good gist regarding implementation details can be found here.](https://gist.github.com/pedro/4372262d570e5187ba1d).  I won't rehash Pedro's great synopsis here, but I will reiterate some sage advise he gives regarding implementation.  It is important and prudent to install something like this in a "metrics gathering mode-only" initially until you get a feel for how things are working in your particular application.  After you get a handle on how things are working, you can start tuning for functional circuit-breakers.

## Conclusion
It's important to program defensively.  Don't hope for and subsequently bank on a bunch of 9's to keep you from having to think about service failures and what happens to your application as a result.  It's important to always give a great user experience and to realize that users don't like funky looking errors codes.  Though users may become frustrated that credit card processing isn't currently working, conveying that you're system is aware of the issue and can at least reserve inventory or some similar best try scenario will go a long way at instilling confidence and will hopefully help you retain customers.

Peter Braswell
pbraswell@heorku.com


