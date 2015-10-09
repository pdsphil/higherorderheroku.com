---
title: Micro-services Off the Starting Blocks? - Part III
date: October 9, 2015
---

## Short recap
In [Part I](http://www.higherorderheroku.com/articles/micro-services-off-the-starting-blocks-part-1/) I talked a little from a theoretical perspective about the practicality of considering a non-micro-services architecture as starting point for an application, not because micro-services are a bad idea, quite the contrary!  The counter balance to micro-services all the time, everywhere is that it inevitably adds complexity which can affect time-to-value of an application.  So what do we do?  In [Part II](http://www.higherorderheroku.com/articles/micro-services-off-the-starting-blocks-part-2/) I stared to lay the ground work for building a web application that is micro-service ready, but is deployed as a single application and does not have the UI entangled with the back-end API.

## AngularJS, Yo and Grunt
First, I'll assume that you have npm installed installed on your machine.  If you don't, there's plenty of readily accessible resources out there to help you with that.  Next, you'll need Yo and the angular generator.  That looks like this:

```bash
npm install -g yo
npm install -g generator-angular
```

Now from the root directory of your project, make a directory for the client piece of your application.  With my amazing powers of creativity, I choose the name 'client':

```bash
mkdir client && cd client
```

Next we'll generate the client app:

```bash
yo angular contacts
```

You should now be able to do something like this and see the Yo welcome page:

```bash
grunt serve
```

If you have any issues, you might need to tweak your [GruntFile.js file](https://github.com/pbraswell/rails_and_angular_example/blob/master/client/Gruntfile.js).  

The next thing you're going to need to do is to wire up a proxy to connect your front end to your back end.  To do that, you'll need to install the Grunt connect proxy like so:

```bash
npm install --save-dev grunt-connect-proxy
```

I had to hack the Gruntfile again to get things to work.  Take a look at my [Gruntfile](https://github.com/pbraswell/rails_and_angular_example/blob/master/client/Gruntfile.js) for reference.

Now you should be able to to to http://localhost:9000/api/contacts and get a json dump of the contacts that we seeded earlier in the project!  Pretty cool, eh?  Cooler still, if you go to http://localhost/#/contacts, you'll see our AngularJS app that is now talking to our back-end rails-api app.

I won't go into exhaustive detail about how to build an AngularJS app and how to get it wired up to a back-end API.  There are already tons of tutorials out there on how to go about that.  If you want to jump right to the interesting bits, have a look at the [app.js file](https://github.com/pbraswell/rails_and_angular_example/blob/master/client/app/scripts/app.js).  This could use some refactoring, but you'll get the idea.  The front markup is pretty standard AngularJS stuff as well and again, I'll leave that up to the reader to figure out.

Now if we build the front end piece, we should have it accessible from our rails app:

## Getting it Deployed to Heroku
This piece is pretty easy, as you'd expect!  If you follow this article from the Heroku DevCenter: ["Building Node.js Apps with Grunt"](https://devcenter.heroku.com/articles/node-with-grunt) you'll be in good shape!












