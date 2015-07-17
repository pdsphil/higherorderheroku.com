---
title: Using the Heroku API and Platform to Build a Poor Man's "Stack On/Off Switch" - Part 1
date: July 18, 2015
---

## The Problem
There are many times your Heroku environment is underutilized and it doesn't make sense to have it running 24/7 and thus stacking up unnecessary charges.  For example, you might have a UAT environment that only needs to be active during business hours or perhaps you have a service that is only available during certain hours.  Whatever the reason, it is easy to automatically scale-up or scale-down your Heroku environment  Though there are certainly add-ons that will help out with this, I thought that using a Heroku application to scale a Heroku application would be an interesting exercise in order to highlight two things: 1) The Heroku platform isn't just for deploying web or mobile applications and 2) You can use our extensive API to achieve finer grained control over your environment.

## How to satisfy this use case
First, let's scope this down a bit.  Though there are tons of things we could do, I want to intentionally keep this demonstrator simple.  Let's create a manageable scope:

1. Have an environment scale up automatically at 8am EST.
2. Have the environment scale down automatically at 5pm EST.

Should be easy enough! I'll add a few constraints as well:

1. This needs to run on Heroku.  Though we could set up a local cron job or explicitly run a script locally to accomplish this, I want to leverage the cloud and not worry about the infrastructure that will be needed to run this thing.
2. Minimize code to the bare minimum.  I don't want to deploy a big Rails app to support 'rake' or anything like that.  But as we'll see, I was forced into deploying more "stuff" than I would have liked.

## Divide and Conquer
I want to try and keep this to manageable bits, so I'm going to break this blog into two parts: The first part will concentrate on getting the process framework up and running and the second part will concentrate on Heroku API's that will accomplish the timed scaling.

## Building out the Process Framework
So my original idea was to have a minimal set of executables as my deployed Heroku application.  Ideally this would just be a bash script that contains the necessary logic to scale-up and scale-down the target application.  Note: in a broader architecture, what I'm going to outline could be included in a standard application as the key logic ends up residing in "bin/run" which can be configured in just about any deployed application.  In theory though, you could use this single approach for affecting more than one application in your Heroku account.  You could accomplish this by passing in more context (application name) to the "bin/run" script, but that's out of scope for this iteration! :)

To my minimalist's end, I wanted to use the [Inline Buildpack](https://github.com/kr/heroku-buildpack-inline).  Though I don't really need a "self-building" buildpack, it seemed reasonable that if I just implemented the /bin/run file and left everything else a 'no-op', it would get me what I wanted: A minimal deployment that contained only what I needed to set up the scaler job, but alas, no banana!  What I ended up with was nothing but errors.  Apparently the platform was having a hard time figuring out what type of application I was trying to deploy.  So much for my minimalist approach.  The deploy error looked like this:

```bash
remote:  !     Push rejected, no Cedar-supported app detected
remote: HINT: This occurs when Heroku cannot detect the buildpack
remote:       to use for this application automatically.
remote: See https://devcenter.heroku.com/articles/buildpacks
```

Just goes to show you that sometimes even the experts have issues.  There were two alternatives at this point.  The first was to continue chasing down why this wasn't working or punt and try something else.  Because of the self-imposed Friday deadline of this blog and my shortage of time, I decided to go with option #2.  Option #2 involved deploying the second most minimal application that I knew I could get deployed and then build from that.  This exactly what I did.  I'll outline my steps next.

## Step-by-step getting the executable framework built:
Step #1: Get a minimal environment deployed onto Heroku.  From past experience, I new that the PHP starter project was a decent place to start, so:

```bash
personal_apps  git clone https://github.com/heroku/php-getting-started.git
```

Step #2: Add the directory and bash script that I would need:

```bash
#bin\bash
mkdir bin
touch bin/run
vim bin/run
.. edit bin/run, insert:
cat bin/run

if [[ $1 == "scale_up" ]] ; then
  echo "Time to scale up!"
elif [[ $1 == "scale_down" ]] ; then
  echo "time to scale down!"
fi
```
Note: The runtime file does absolutely nothing of interest other than print some output.  One step at a time!

Step #3: Create and deploy

```bash
heroku create -n plunky
heroku push heroku master
  ...
```

Step #4: Verify that the runtime file does something:

```bash
heroku run bin/run "scale_up"
Running `bin/run scale_up` attached to terminal... up, run.7503
Time to scale up!
```

... So far, so good!

Step #5 Integrate with the Heroku Scheduler add-on:

```bash
heroku addons:create scheduler:standard
Creating practicing-newly-8218... done, (free)
Adding practicing-newly-8218 to plunky... done
This add-on consumes dyno hours, which could impact your monthly bill. To learn more:
http://devcenter.heroku.com/addons_with_dyno_hour_usage
heroku addons:open scheduler
```

And then I added the following jobs via the dashboard.  Note: All times are in UTC, so you have to do a little math.

[Click for Scheduler Dashboard Setup](https://www.evernote.com/l/AAPJcG4qbAlHTKB9YzuRCC03Yh7ed2m4Gqg)

## Conclusion - Part 1
I also scheduled a job to run at the top of the hour so I could visually verify that *something* happened when I expected it to.  I did the following to monitor the job and verify that my run script actually was run at the top of the hour:

```bash
heroku logs -t
...
2015-07-17T14:00:04.758790+00:00 heroku[api]: Starting process with command `bin/run "scale_up"` by scheduler@addons.heroku.com
2015-07-17T14:00:11.484845+00:00 heroku[scheduler.3099]: Starting process with command `bin/run "scale_up"`
2015-07-17T14:00:12.161855+00:00 heroku[scheduler.3099]: State changed from starting to up
2015-07-17T14:00:12.836833+00:00 app[scheduler.3099]: Time to scale up!
2015-07-17T14:00:13.534465+00:00 heroku[scheduler.3099]: State changed from up to complete
2015-07-17T14:00:13.521777+00:00 heroku[scheduler.3099]: Process exited with status 0
```

So with this, I think we're in good shape.  We've got a *mostly* minimal app deployed to control the on/off script, the correct add-on that acts like a cron job and we've verified that everything is working properly.  So if I do nothing else with this application, it will run the script "bin/run" at 8am EST and again at 5pm EST with the correct arguments to either trigger a scale-up event or a scale-down event. Next week then, we'll work on fleshing out the mechanics of actually affecting those scale changes against the application!

Peter Braswell
pbraswell@heroku.com