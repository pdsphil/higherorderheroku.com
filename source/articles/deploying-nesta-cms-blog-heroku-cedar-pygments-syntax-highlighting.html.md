---
title: Deploying a Nesta CMS Blog with Pygments Syntax Highlighting to Heroku
date: February 22, 2012
---

Blogging and/or setting up a simple site should be a simple proposition. There are a lot of great frameworks out there that handle the software portion of running such a site. However, you don't just want a stock setup. You have to take into account proper asset caching for performance, slick syntax highlighting, an aesthetically pleasing theme, app instrumentation, feed redirection and production deployment.

I've gone ahead and boiled down all these concerns into just a few steps based on the [Nesta CMS](http://nestacms.com) framework.


If you're not much for foreplay a fully deployable starter template of this site can be found <a href="http://github.com/rwdaigle/nesta-app-template">here on GitHub</a> and seen running <a href="http://nesta-app-template.herokuapp.com/">here on Heroku</a>.


## Background

Having wrestled with quite a few blogging engines in the past I had several requirements of a new setup. Firstly it had to support a workflow that lets me write on my local machine using the tools I prefer, namely [markdown formatted articles](http://daringfireball.net/projects/markdown/) composed with [IA Writer](http://www.iawriter.com/) or a basic text editor.

Second, it had to support a git-based workflow. My content is going to live in git and there's no reason the publishing platform shouldn't build on top of that as well. This also plays well with [Heroku](http://heroku.com) deployments.

Static site generators are all the rage and fulfill the first two requirements. However, I've found them to be rather rigid and obtrusive for the very incremental edit-view-edit workflow I assume when writing. My last requirement was that I could write and immediately refresh my browser to see the fully rendered site running locally. Waiting for the whole site to generate on every minor edit proved to be far too slow for me in the past.

Fortunately, there's a better way.

## Landscape

The list of dynamic file-backed Heroku-friendly blog engines isn't particularly long. I investigated both [Toto](http://cloudhead.io/toto) and [Nesta CMS](http://nestacms.com/) and, after a brief wrestle trying to get Toto's HTTP request headers to play nice with rack-cache, settled on Nesta. Nesta is under active development and is written with Sinatra, the very simple and hackable web framework for Ruby.

For deployment [Heroku](http://heroku.com) is the obvious choice given its seamless git-based workflow and variety of [add-ons](http://addons.heroku.com). I also work there.


These steps assume you have <a href="http://git-scm.com/">git</a> and <a href="http://www.ruby-lang.org/en/">ruby</a> available from the command line and have already signed up for a <a href="https://api.heroku.com/signup">Heroku account</a>. The <a href="http://toolbelt.heroku.com/">Heroku Toolbelt</a> can get you up and running if you're missing any components.


## Template

Though the [Nesta quick-start](http://nestacms.com/docs/quick-start) is solid, as are all their docs, we can skip ahead by using an app template. I've created one [on github](https://github.com/rwdaigle/nesta-app-template) that's already setup for syntax highlighting with [Pygments](http://pygments.org/), the ["clean" theme](https://github.com/rwdaigle/nesta-theme-clean) you see running this site and the minimal artefacts needed to quickly deploy and provision a full-featured Heroku app.

Fork the starter template using the "Fork" button on the [template GitHub page](https://github.com/rwdaigle/nesta-app-template).

![Fork starter template screenshot](http://f.cl.ly/items/2g1E2H1n0X0T3y0v3S2K/Screen%20Shot%202012-02-22%20at%207.43.19%20PM.png)

This will fork it to your GitHub account. From there you can clone your fork locally. Find the repository URL for your fork and copy it (your URL will differ from the one shown below).

![Repository URL screenshot](http://f.cl.ly/items/163a0t1n3w0D282v3v25/repo-url.png)

Clone the app template to your local environment using `git`. Use the domain name of your site instead of `mysite.com`

```bash
$ git clone git@github.com:rwdaigle/nesta-app-template.git mysite.com
Cloning into mysite.com...
remote: Counting objects: 72, done.
remote: Compressing objects: 100% (38/38), done.
remote: Total 72 (delta 29), reused 63 (delta 20)
Receiving objects: 100% (72/72), 11.69 KiB, done.
Resolving deltas: 100% (29/29), done.
```

The application's source is now installed locally in the `mysite.com` directory.

## Run

Now that the site template is present in the local environment you can install required dependencies and render the site locally before deploying to a remote server environment. A `bootstrap.sh` script is provided for your convenience.


The <code>bootstrap.sh</code> script does not use sudo or make any destructive commands. However, please review the script source before executing.


```bash
$ cat bootstrap.sh
# ... script source

$ ./bootstrap.sh 
Using RedCloth (4.2.9) 
Using addressable (2.2.7) 
# ...
Submodule path 'themes/clean': checked out '889e094749008d2bf4ecf901555fce44c7f7bc87'
```

Once bootstrap has finished start the app using the `foreman` utility.

```bash
$ foreman start
14:25:47 web.1     | started with pid 59647
```

Opening [http://localhost:5000](http://localhost:5000) should display the site running with a single getting started article listed on the home page. Any errors that occur will be shown in the terminal where you entered the `foreman start` command.

## Deploy

Assuming you have a Heroku account and have successfully installed the [Heroku Toolbelt](http://toolbelt.heroku.com) you can use the provided helper script to quickly deploy the site install any dependencies and setup the appropriate configuration.


The app deployed to Heroku will not incur any charges on Heroku.


```bash
$ cat deploy.sh
# ... review script source ...

$ ./deploy.sh 
Creating vivid-sword-9170... done, stack is cedar
Adding memcache to vivid-sword-9170... done
# ...
Opening http://vivid-sword-9170.herokuapp.com/
```

## Next

You've forked your own copy of the app template, got it running locally and deployed it for free to Heroku. Not bad for a few minutes of your time! To customize the site, setup analytics and write your first post go ahead and read the welcome post included in your new site (a copy can be found [here](http://nesta-app-template.herokuapp.com/welcome)). 

![Welcome post screenshot](http://cl.ly/ESq1/Screen%20Shot%202012-02-22%20at%207.57.40%20PM.png)

My hope is this template and theme eliminates many of the sticking points associated with taking a great framework like Nesta and turning it into a running, usable and deployed site. Let me know if you run into any issues (or better yet, submit a pull request to the template or theme projects on GitHub).