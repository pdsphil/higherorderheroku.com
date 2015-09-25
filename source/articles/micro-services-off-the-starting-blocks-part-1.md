---
title: Micro-services Off the Starting Blocks? - Part I
date: September 25, 2015
---

## Introduction
I don't intend for this to be one of those contrarian articles where I proclaim that the current trend is all wrong, that we're woefully misguided and we need to change course before the world breaks off and falls into the ocean.  No, I actually am a big fan of micro-services.  In practice, micro-service architecture allows us to break applications down into modular components, which seems to be an ever chased goal for as long as I've been in the business.  Micro-services allow constituent parts of our business systems to grow independently.  The micro-services architecture also allow organizations to build cross-functional teams that can concentrate on business processes independently.  Micro-services also allow more flexibility around tool-chains and can facilitate technology upgrades to small parts of the system without the fear and loathing of the "big-bang" re-write.  So what's not to love, right?

## Always and forever?
But do we always need to start with micro-services?  [In DHH's book "Rework"](https://37signals.com/rework/) David emphasizes (among other great advice) "Build Something".  I've been around enough software projects in my career to become very sensitive to excessive "navel gazing", over and premature optimization and architectures that are intended to address "what we think we'll need" as opposed to what we need right now.  It is this spirit that maybe we should roll up our sleeves and just build something relatively simple which evolves as we know more as opposed to building out the universe's most wicked micro-architecture.  My thinking here is that maybe we can build something functional, that addresses what we know about our requirements right now but has a bit of wiggle room to allow us to cleave off pieces as it becomes necessary.  We'll need just a touch of self control and foresight to do this.  It can however, be done!

## Roadmap
I'm beginning to develop a fondness for these multi-part articles, my own literary micro-architecture if you will.  It gives me the ability to chunk down my articles into meaningful (and hopefully) easily digestible pieces.  To that end, I would like to explain the rational and approach for how an "evolve-to" micro-services architecture might look conceptually.  I'll outline the justifications for this approach in this first article and then I'll follow up with a real-world, albeit small practical, [Heroku deployable](http://www.heroku.com) example in the second installment.

## Tee it up!
I've seen a lot of applications as a Solutions Architect @ Heroku and what I've seen really does cover the spectrum in terms of needed complexity verses actual.  I'd like to draw on that experience and build out a business scenario that has reasonable fidelity to reality.  I generally find overly contrived examples unhelpful.  So with that, let's talk about a typical startup that wishes to deploy an application.  With today's current state of the art, we can expect two distinct pieces to the application.  The first piece is a set of back-end API that will run the core business logic.  The second piece is of course the UI that will take the form of a web application initially.  There are plans to support mobile clients at some point, hence the API architecture.  I think it's good form to build your applicaiton on the backbone of your API.  You'll discover things you didn't expect and the API will end up being more capable of supporting the other integrations you'll be planning.

So there are several ways to realize these requirements.  One easy way would be to use a framework like [Ruby on Rails](www.rubyonrails.org) that has a lot of good practices built in, like RESTful API routes, a sane ORM toolkit and a decent MVC implementation.  A single, some would argue, monolithic Rails app is easy to build out and easy to deploy.  There can be some tricky de-coupling work that you might end up doing when the time comes to separate UI concerns from the back-end.  A case in point might be an "SPA". SPA or single page app are, as the name implies, single page / responsive apps and are powered by javascript frameworks such as [AngularJS](https://angularjs.org/) are gaining popularity.  There can be an impedance between such front-end frameworks and all-inclusive frameworks like Rails.  There's also the difficulty of pulling these two pieces apart at some point in the future in the case of a pure "Rails" application.

## My proposal
What I'd like to suggest then is building out the best of both worlds but initially keeping the entire code-base, database ORM structure and back-end API all bundled up in a single deployable application, initially but maintain the right structure to the application that will allow the API to expand and split off from the UI in a deliberate and just-in-time fashion.  To that end, I'll be building out an application that has a distinct UI built with AngularJS and a distinct back-end that is Ruby/Rails based.  I hope to illustrate best practice in both these areas (local development fidelity, AngularJS dependency management via [Yeoman](http://yeoman.io/learning/), deployment on Heroku and other cool stuff).  When I'm done, I'll have a not-so-micro-services architecture that can easily evolve and convert to a micro-services architecture when the time is right.

With that, Let me get busy!  We'll talk again next week!





