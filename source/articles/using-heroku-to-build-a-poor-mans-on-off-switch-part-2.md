---
title: Using the Heroku API and Platform to Build a Poor Man's "Stack On/Off Switch" - Part 2
date: July 24, 2015
---

## Review
In case you missed part one, you can catch yourself up with what we're building here [Heroku API and Platform to Build a Poor Man's "Stack On/Off Switch" - Part 1](http://www.higherorderheroku.com/articles/using-heroku-to-build-a-poor-mans-on-off-switch-part-1/)

For a quick refresher, this is the gist of what we're trying to build out.  We'd like something in place that does the following:

1. Have a Heroku environment scale up automatically at 8am EST.
2. Have the environment scale down automatically at 5pm EST.

Additionally:

1. This needs to run on Heroku.  Though we could set up a local cron job or explicitly run a script locally to accomplish this, I want to leverage the cloud and not worry about the infrastructure that will be needed to run this thing.
2. Minimize code to the bare minimum.  I don't want to deploy a big Rails app to support 'rake' or anything like that.

## Not much more to do
There's really not a whole lot more involved with getting this functional.  The next step is to make the bin/run script actually do something that affects the number of running dynos.  We're going to use the Heroku API to make this happen.

### Step #1

We'll need to figure out what our API token is.  That's pretty easy.  You can either invoke a call on the command line or look in your dashboard under "Manage Account".  Here, I'll illustrate how to do this on the command line:

```bash
➜  php-getting-started git:(master) heroku auth:token
<redacted>
```
Now use this API key to set an environmental vairable:

```bash
heroku config:set API_TOKEN=<redacted> -a plunky
Setting config vars and restarting plunky... done, v9
API_TOKEN: <redacted>
```
### Step #2

We need to modify the run script that we deployed in the last installment to call the Heorku API to affect the changes against our target environment.  Essentially we want to add an API call that increases the number of dynos when the scheduler fires the "scale_up" event and to decrease the number of dynos on a "scale_down" event.

That's pretty easy, here's the new script in bin/run in its entirety:

```bash
#!/bin/bash
if [[ $1 == "scale_up" ]] ; then
  echo "Time to scale up!"
  curl -n -X PATCH https://api.heroku.com/apps/peters-node-helloworld/formation/web \
    -H "Accept: application/vnd.heroku+json; version=3" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "quantity": 4,
      "size": "1X"
    }'
elif [[ $1 == "scale_down" ]] ; then
  echo "time to scale down!"
    curl -n -X PATCH https://api.heroku.com/apps/peters-node-helloworld/formation/web \
    -H "Accept: application/vnd.heroku+json; version=3" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "quantity": 0,
      "size": "1X"
    }'
fi
```

### Step #3

It's easy to test to make sure things are working properly without having to wait for the scheduler to fire off an event.  We can do that by running the 'run' script manually like so:

```bash
➜  php-getting-started git:(master) heroku run bin/run "scale_up"
Running `bin/run scale_up` attached to terminal... up, run.8440
Time to scale up!
{
  "app":{
    "id":"61b89d20-f5ca-4114-88ff-23a27dbd7fb3",
    "name":"peters-node-helloworld"
  },
  "command":"node web.js",
  "created_at":"2014-10-15T17:46:20Z",
  "id":"ceb19918-10fc-43cc-aadf-ed17a0606651",
  "type":"web",
  "quantity":4,
  "size":"1X",
  "updated_at":"2015-07-24T14:54:32Z"
}
```

I've already covered how to set up the Heroku Scheduler add-on to call this script at a specific time, so I won't rehash that bit here.  Please link back to [Part 1](http://www.higherorderheroku.com/articles/using-heroku-to-build-a-poor-mans-on-off-switch-part-1/) to refresh how that's done.


## Conclusion - Part 2
So that's it!  With an absolute minimum of code, we've been able to code up a relatively effective means of scaling up and scaling down an environment based on the time of day.  There are certainly ways you could expand this use case and this example should give you a good basis and jumping off point to explore those extended use cases!

Peter Braswell
pbraswell@heroku.com