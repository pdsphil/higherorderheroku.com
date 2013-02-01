---
title: Building Dependency Binaries for Heroku Applications
date: July 10, 2012
---

Managing an application's code dependencies, once a source of constant pain and conflict, is now a solved problem in most modern languages. Ruby has [Bundler](http://gembundler.com/), Node.js has [npm](http://npmjs.org/), Python has [pip](http://pypi.python.org/pypi/pip), Clojure has [Leiningen](https://github.com/technomancy/leiningen)… the list continues.

What remains unsolved is how to declare and manage system-level dependencies -- external binaries on which your application is dependent. This article explores explicitly managing and building system-level dependencies using the [Vulcan](https://github.com/heroku/vulcan) build server.

## Problem

It's common for an application to shell out to a local executable to perform some computationally intense work where compiled libraries are more performant or robust. Examples include [Ghostscript](http://www.ghostscript.com/), which your application might use to manipulate PDF or PostScript files and [ImageMagick](http://www.imagemagick.org/script/index.php) for resizing and cropping uploaded images.

Many deployment services attempt to fill this need by providing a set of common binaries bundled into every environment. This is a fragile approach that boxes you in to out-dated or incompatible library versions.

Having the ability to install system-wide binaries in your deployment environment is also poor solution. It merely shifts the burden of dependency management from the service provider to you, the application developer.

[Twelve-factor](http://www.12factor.net/) is firm in [its stance on system-level dependencies](http://www.12factor.net/dependencies):

> Twelve-factor apps also do not rely on the implicit existence of any system tools... While these tools may exist on many or even most systems, there is no guarantee that they will exist on all systems where the app may run in the future, or whether the version found on a future system will be compatible with the app. If the app needs to shell out to a system tool, that tool should be vendored into the app.

## Solution

Vendoring a binary dependency requires that the binary be built specifically for the remote environment's operating system and processor architecture. Even with the benefits of virtual machine software this is a non-trivial task for developers.

A better solution is to use the remote environment of your service provider to compile and build the required dependencies. Such a process loosely adheres to the following steps:

1. Specify the required library's source
2. Get a remote shell to your production environment
3. Download the library source in the remote shell
3. Compile the library remotely
4. Download the compiled library for use in your application's source-tree

While this process is not a lengthy one, your eye should spot that steps 2-5 are ripe for automation. That's where Vulcan comes in.

[Vulcan](https://github.com/heroku/vulcan) is a utility that bundles and uploads a source-tree to a remote environment, runs the necessary compilation commands on the source tree, and downloads the resulting binary -- all in a single command. Vulcan consists of a Ruby-based CLI and Node.js server and, though built by and for Heroku, is platform-agnostic.

## Setup

Installing the Vulcan CLI is simply a matter of installing the `vulcan` gem:

These steps assume you have <a href="http://git-scm.com/">git</a> and <a href="http://www.ruby-lang.org/en/">ruby</a> available from the command line and have already signed up for a <a href="https://api.heroku.com/signup">Heroku account</a>. The <a href="http://toolbelt.heroku.com/">Heroku Toolbelt</a> can get you up and running if you're missing any components.

```bash
$ gem install vulcan
Please run 'vulcan update' to update your build server.
Successfully installed vulcan-0.7.1
1 gem installed
```

Vulcan's [build-server](https://github.com/heroku/vulcan/tree/master/server) is a simple Node.js app that runs _in the same target environment your application will be deployed_. If your app runs on Heroku, Vulcan can deploy itself to Heroku with `vulcan create appname`.

You will need a [verified Heroku account](https://devcenter.heroku.com/articles/account-verification) before running this command as Vulcan requires the use of a (free) add-on.

```bash
$ vulcan create buildserver-you
Creating buildserver-you... done, stack is cedar
http://buildserver-you.herokuapp.com/ | git@heroku.com:buildserver-you.git
Initialized empty Git repository in /private/var/folders/Uz/UzRCgjzkGIi7Iqz9QNi6NUDrHf6/-Tmp-/d20120614-31875-1qjw1d6/.git/
Counting objects: 883, done.
...

-----> Heroku receiving push
-----> Node.js app detected
...
       Dependencies installed
-----> Discovering process types
       Procfile declares types -> web
-----> Compiled slug size is 4.1MB
-----> Launching... done, v3
       http://buildserver-you.herokuapp.com deployed to Heroku
```

The Vulcan build server is now running on Heroku at `http://buildserver-you.herokuapp.com` as a (free) single-dyno app. It's important to note there's nothing blessed about Vulcan running on Heroku. It's just a normal application running in user-space, giving you all the [visibility](#visibility) and management tools you're used to.

If you've manually deployed the build server to another provider you'll need to set its location so the [CLI knows where to send build tasks](https://github.com/heroku/vulcan/blob/master/lib/vulcan/cli.rb#L40). This is done by setting the `VULCAN_HOST` env var: `$ export VULCAN_HOST=http://myserver.domain.com`..

## Build

The Ghostscript library utilized in the [processing PDF files](https://devcenter.heroku.com/articles/processing-pdfs-ruby-mongo) tutorial on the [Heroku Dev Center](http://devcenter.heroku.com) makes for a good example of building a binary application dependency.

### Download source

First, download and expand the Linux x86 64-bit source for the [Ghostscript project](http://www.ghostscript.com/). At the time of this writing it is located at [http://downloads.ghostscript.com/public/binaries/ghostscript-9.05-linux-x86_64.tgz](http://downloads.ghostscript.com/public/ghostscript-9.05.tar.gz).

For the purpose of this article Heroku will be assumed to be the target environment. [Heroku's dynos](https://devcenter.heroku.com/articles/dynos) run on 64-bit Linux kernel. If your target environment differs you will need to select the correct source distribution.

```bash
$ wget http://downloads.ghostscript.com/public/ghostscript-9.05.tar.gz
$ tar -xvzf ghostscript-9.05.tar.gz 
x ghostscript-9.05/
x ghostscript-9.05/base/
x ghostscript-9.05/base/szlibxx.h
...
```

You now have a Ghostscript source directory at `./ghostscript-9.05`.

### Remote compilation

Next, use the Vulcan CLI to initiate a build task on the build server with `vulcan build`. This will send the source to the target environment for compilation. The only required argument is `-s`, the location of the Ghostscript source directory. The `-v` flag (verbose) will show the output from the compilation process and is recommended as, depending on the library, compilation can take some time and it's useful to see its progress.

```bash
$ vulcan build -v -s ./ghostscript-9.05
Packaging local directory... done
Uploading source package... done
Building with: ./configure --prefix /app/vendor/ghostscript-9 && make install
checking for gcc... gcc
checking whether the C compiler works... yes
...
>> Downloading build artifacts to: /tmp/ghostscript-9.tgz
   (available at http://buildserver-you.herokuapp.com/output/45380fa6-e02a-479b-a7af-d9afb089b81f)
```

On completion of the build process the resulting binaries are packaged and downloaded for you. In this example the binary package can be found locally at `/tmp/ghostscript-9.tgz` and remotely at `http://buildserver-you.herokuapp.com/output/45380fa6-e02a-479b-a7af-d9afb089b81f`.

Although the [Vulcan source](https://github.com/heroku/vulcan) indicates the ability to fetch source packages directly from a URL (i.e. `$ vulcan build -s http://downloads.ghostscript.com/public/ghostscript-9.05.tar.gz` this tends to result in build errors. At this time the most reliable method is to manually download and expand the source before passing to vulcan.

## Customization

Looking at the output from the Ghostscript example you can see that a sensible [autoconf-based](http://en.wikipedia.org/wiki/Autoconf) command is chosen for you: `./configure --prefix /app/vendor/ghostscript-9 && make install`. If you need to specify a non-default build command you can do so with the `-c` flag. Here is an example adding the `--without-ssl` configure option when building `wget`.

```bash
$ vulcan build -v -s ./wget-1.13 -c "./configure --prefix /app/vendor/wget-1.13 --without-ssl && make install" -p /app/vendor/wget-1.13
Packaging local directory... done
Uploading source package... done
Building with: ./configure --without-ssl && make install
configure: configuring for GNU Wget 1.13
...
>> Downloading build artifacts to: /tmp/wget-1.tgz
   (available at http://buildserver-you.herokuapp.com/output/66ba3e2b-77ef-4409-acc2-fca70650c318)
```

The `-p` (prefix) flag is also used here to tell Vulcan where to look on the build server for the compiled artifacts (`/app/vendor/wget-1.13`). To avoid ambiguities it's best to specify this value and to set it to the same value as the `--prefix` flag passed to `./configure`.

## Vendoring

Once you have a binary appropriate for use on Heroku you need to vendor it within your application. Though conventions vary by language the approach taken is similar across them all. Vendoring the `wget` executable is a straight-forward process.

Create a `vendor` directory that will house the `wget` binary and copy in the executable from the vulcan [build results](http://cl.ly/1B0n121X1T200g3u2a1k/wget-1.tgz).

```bash
$ mkdir -p vendor/wget/bin
$ cp /tmp/wget-1/bin/wget vendor/wget/bin/
```

The [null buildpack](https://github.com/ryandotsmith/null-buildpack) can be used to test `wget` in isolation. Create a Heroku app that consists only of this `vendor` directory and specify the null buildpack.

```bash
$ git init
$ git add .
$ git commit -m "Vendored wget"

$ heroku create --buildpack https://github.com/ryandotsmith/null-buildpack
Creating severe-water-5643... done, stack is cedar
BUILDPACK_URL=https://github.com/ryandotsmith/null-buildpack
http://severe-water-5643.herokuapp.com/ | git@heroku.com:severe-water-5643.git
Git remote heroku added
```

Add `vendor/wget/bin` to the app's `PATH` and deploy it to Heroku.

```bash
$ heroku config:add PATH=vendor/wget/bin:/usr/bin:/bin
Setting config vars and restarting severe-water-5643... done, v6
PATH: vendor/wget/bin:/usr/bin:/bin

$ git push heroku master
...
-----> Heroku receiving push
-----> Fetching custom buildpack... done
-----> Null app detected
-----> Nothing to do.
-----> Discovering process types
       Procfile declares types -> (none)
-----> Compiled slug size is 172K
-----> Launching... done, v4
       http://severe-water-5643.herokuapp.com deployed to Heroku

To git@heroku.com:severe-water-5643.git
 * [new branch]      master -> master
```

To test that the compiled version of wget works use a one-off dyno to run a test command:

```bash
$ heroku run wget http://www.google.com/images/logo_sm.gif
Running wget http://www.google.com/images/logo_sm.gif attached to terminal... up, run.1
...
HTTP request sent, awaiting response... 200 OK
Length: 3972 (3.9K) [image/gif]
Saving to: 'logo_sm.gif'

100%[=============================================================>] 3,972       --.-K/s   in 0s

2012-07-10 14:48:48 (200 MB/s) - 'logo_sm.gif' saved [3972/3972]
```

The command was successfully invoked on Heroku using the vulcan-compiled `wget` executable and the output (but not the fetched file) was streamed to your local shell.

## Visibility

There are several utilities available to you to introspect the remote compilation process.

### Logging

Outside of using the `-v` flag to force see the build output you can also use the logs of the Vulcan build server to gain better visibility into the process. Since the Vulcan build server is just a Node.js app running in your target environment this is a trivial task. On Heroku use `heroku logs` and the `-a` flag with the name of your build server app.

```bash
$ heroku logs -t -a buildserver-you
2012-07-04T15:29:20+00:00 app[web.1]: [7f3a7510-400a-44d4-9132-66a2e6c878a5] spawning build
2012-07-04T15:29:20+00:00 app[web.1]: valid socket
2012-07-04T15:29:21+00:00 heroku[run.1]: Awaiting client
2012-07-04T15:29:21+00:00 heroku[run.1]: Starting process with command `bin/make "7f3a7510-400a-44d4-9132-66a2e6c878a5"`
2012-07-04T15:29:22+00:00 heroku[run.1]: State changed from starting to up
2012-07-04T15:30:10+00:00 heroku[run.1]: Process exited with status 1
2012-07-04T15:30:10+00:00 heroku[run.1]: State changed from up to complete
```

By default Vulcan will spawn a [on-off dyno](https://devcenter.heroku.com/articles/oneoff-admin-ps) to perform the build command. This is evident by the `run.1` dyno in the log output. In some circumstances this can result in a billable event if your web and one-off dyno usage combined [exceeds 750 hours for any one month](https://devcenter.heroku.com/articles/usage-and-billing).

If this small overage is meaningful to you you can sacrifice compilation concurrency and force Vulcan to execute the compilation command in-process with the `SPAWN_ENV` [config var](https://devcenter.heroku.com/articles/config-vars).

```bash
$ heroku config:add SPAWN_ENV=local -a buildserver-you
Setting config vars and restarting buildserver-you... done, v11
SPAWN_ENV: local
```

The build command will then execute within the web process:

```bash
$ heroku logs -t -a buildserver-you
2012-07-04T15:35:43+00:00 app[web.1]: [bbeab2b8-3941-4d41-94af-24c4f0fa65c0] spawning build
2012-07-04T15:36:33+00:00 app[web.1]: 10.125.41.68 - - [Wed, 04 Jul 2012 15:36:33 GMT] "GET /output/bbeab2b8-3941-4d41-94af-24c4f0fa65c0 HTTP/1.1" 200 - "-" "Ruby"
2012-07-04T15:36:33+00:00 heroku[router]: GET buildserver-you.herokuapp.com/output/bbeab2b8-3941-4d41-94af-24c4f0fa65c0 dyno=web.1 queue=0 wait=0ms service=35ms status=200 bytes=75
```

While this fails to adhere to the [background job](https://devcenter.heroku.com/articles/background-jobs-queueing) pattern it may be acceptable for your use-case.

### Remote shell

If a build fails it is often useful to be able to view the failed artefacts. Since Vulcan performs its work in temporary directories their contents are cleaned up after each build. However, a remote shell can be used to manually invoke the build command and navigate the build results.

At the start of every build request Vulcan outputs log statements resembling the following:

```bash
2012-07-04T18:57:10+00:00 app[web.1]: [6869e68a-492d-4a7e-8b27-64352811d7dc] saving to couchdb
2012-07-04T18:57:10+00:00 app[web.1]: [6869e68a-492d-4a7e-8b27-64352811d7dc] saving attachment - [id:6869e68a-492d-4a7e-8b27-64352811d7dc rev:1-722a96f6734a3511efd73b7cfb9a2aed]
```

The attachment id, here `6869e68a-492d-4a7e-8b27-64352811d7dc`, is all that's needed to manually invoke the build yourself. Establish a remote shell to the Vulcan build server environment. On Heroku you can use `heroku run bash`:

```bash
$ heroku run bash -a buildserver-you
~ $
```

Then invoke the `bin/make` command with the attachment id. You will see the output of the build process and can then browse the output directory yourself.

```bash
$ bin/make "6869e68a-492d-4a7e-8b27-64352811d7dc"
configure: configuring for GNU Wget 1.13
checking for a BSD-compatible install... /usr/bin/install -c
checking whether build environment is sane... yes
...
$ cd /app/vendor/wget-1.13
```

## Updates

Updating Vulcan is simple. Update the CLI using ruby gems:

```bash
$ gem install vulcan
Please run 'vulcan update' to update your build server.
Successfully installed vulcan-0.8.0
1 gem installed
```

And use the `vulcan update` command to update the build server.

Be aware that updating the build server while active compilations are running will cause them to be aborted.

```bash
$ vulcan update
Initialized empty Git repository in /private/var/folders/tt/7f38d4b14qq5xglpj3yl0smr0000gn/T/d20120704-53816-m4n0rn/.git/
Counting objects: 883, done.
...

-----> Heroku receiving push
-----> Node.js app detected
-----> Resolving engine versions
       Using Node.js version: 0.6.18
       Using npm version: 1.1.4
...
-----> Launching... done, v15
       http://buildserver-you.herokuapp.com deployed to Heroku

To git@heroku.com:buildserver-you.git
 + a5f27be...a934704 master -> master (forced update)
```

## Troubleshooting

### Invalid secret

If working across multiple development environments or some other non-default workflow you may see the following build server error logged when attempting to invoke a build:

```
2012-07-04T17:39:47+00:00 app[web.1]: [672b5df6-ad8c-49ed-9831-515207e2dc4f] ERROR: invalid secret
2012-07-04T17:39:47+00:00 app[web.1]: invalid secret
```

This occurs when the CLI secret hash, created when the build server was created with `vulcan create`, either doesn't exist or doesn't match the server-side secret. The most common cause is that the `~/.vulcan` configuration file doesn't exist in your environment. You can create it with the following contents:

```yaml
--- 
:app: buildserver-you
:host: buildserver-you.herokuapp.com
:secret: reallylonghash12df
```

If you don't have access to your original `.vulcan` file you can find your secret on Heroku using `heroku config`:

```bash
$ heroku config:get SECRET -a buildserver-you
reallylonghash12df
```

Copy your `~/.vulcan` file to each development machine from which you wish to invoke builds.

## Heroku binaries

During the course of writing this article the following binaries were compiled for use on Heroku.

If you'd like to list a Heroku binary here, please [send a pull request](https://github.com/rwdaigle/ryandaigle.com/blob/master/content/pages/a/using-vulcan-to-build-binary-dependencies-on-heroku.mdown).

<table>
  <tr>
    <th>Library</th>
    <th>Build command</th>
    <th>Binary</th>
    <th>Contributor</th>
  </tr>
  <tr>
    <td><a href="http://ftp.gnu.org/gnu/wget/wget-1.13.tar.gz">GNU Wget v1.13</a></td>
    <td><code>vulcan build -v -s ./wget-1.13 -c "./configure --prefix /app/vendor/wget-1.13 --without-ssl && make install" -p /app/vendor/wget-1.13</code></td>
    <td><a href="http://cl.ly/1B0n121X1T200g3u2a1k/wget-1.tgz">download</a></td>
    <td><a href="https://twitter.com/rwdaigle">@rwdaigle</a></td>
  </tr>
  <tr>
    <td><a href="http://www.imagemagick.org/download/ImageMagick.tar.gz">ImageMagick v6.7.8-1</a></td>
    <td><code>vulcan build -v -s ./ImageMagick-6.7.8-1</code></td>
    <td><a href="http://cl.ly/011m0E3w2I360X2s1D2d/ImageMagick-6.7.tgz">download</a></td>
    <td><a href="https://twitter.com/rwdaigle">@rwdaigle</a></td>
  </tr>
  <tr>
    <td><a href="http://downloads.ghostscript.com/public/ghostscript-9.05.tar.gz">Ghostscript v9.05</a></td>
    <td><code>vulcan build -v -s ./ghostscript-9.05</code></td>
    <td><a href="http://cl.ly/192z2W1H2i1e3o0W341V/ghostscript-9.tgz">download</a></td>
    <td><a href="https://twitter.com/rwdaigle">@rwdaigle</a></td>
  </tr>
</table>