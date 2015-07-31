---
title: Injecting a Git revision number into your application at deploy time
date: July 31, 2015
---

## The Problem
Sometimes you'd like to be able to inject some information into your application that allows you to identify what exactly is deployed and running.  This is pretty easy to do with a bit of scripting, an environmental variable and the Heroku API.


## The bash script
This script just picks up the revision value from your local git repo and stuffs that value into a Heroku environmental variable that is then made available to the application.  This is bare-bones and nitty-gritty but it works!  You'll have to replace the ubiquitous "git push heroku master" with the following scirpt.  To make things easy, I just put this script in the root directory of my project.  For lack of anything more creative, I just name this script "deploy.sh"

```bash
#!/bin/bash
REVISION="$(cat .git/refs/heads/master)"
echo $REVISION
heroku config:set GIT_REVISION=$REVISION
git push heroku master
```

## Accessing From Your Application
This is the easy part.  Most languages and frameworks have the ability to read vairables from the environment.  Since I'm most familiar with Ruby, this is the way you'd do it in that language:

```ruby
<p>The currently deployed GIT revision is: <%=ENV['GIT_REVISION']%></p>
```

That's it!  Pretty easy and pretty handy!  Happy Hacking!!

Peter Braswell
pbraswell@heroku.com