---
title: Using `pg:transfer` to Migrate Postgres Databases
date: September 18, 2012
---

Development of most applications takes place in several disparate environments with the most common pattern being dev-staging-production. While it's necessary for the source versions in each environment to differ it is quite useful to retain some level of data synchronicity between the environments (for example, to populate your local database with production data to diagnose a bug).

When managing environments on [Heroku](http://heroku.com) the recommendation has been to use [Taps and `heroku db:pull`/`heroku db:push`](https://devcenter.heroku.com/articles/taps) to transfer data to and from the remote Postgres database. While Taps aimed to be database-agnostic (allowing you to import/export between different database vendors) this came at the expense of robustness and maintainability. The fragility of the tool is [evident on Stackoverflow](http://stackoverflow.com/search?q=%5Bheroku%5D+%22db%3Apull%22).

The [Heroku `pg:transfer` CLI plugin](https://github.com/ddollar/heroku-pg-transfer) is a more stable and predictable tool that automatically transfers data between two Postgres databases using native pg tools and protocols. You should consider `heroku pg:transfer` an immediate replacement for `heroku db:pull`.

## Install

As more developers adopt the Twelve-Factor tenet of [environment parity](http://www.12factor.net/dev-prod-parity) the need to perform data migrations across database vendors is eliminated. This allows the ability to use a database's native import/export tools, resulting in a much more predictable data migration process.


Most apps on Heroku are already using the incredible [Heroku Postgres service](http://postgres.heroku.com) and _should_ be running Postgres locally as well. If not, the [Postgres.app project](http://postgresapp.com/) will get you up and running on OSX in minutes.


Install the plugin by running the following from the terminal:

```bash
$ heroku plugins:install https://github.com/ddollar/heroku-pg-transfer
```

Confirm the plugin installation by running the `pg:transfer --help` command:

```bash
$ heroku pg:transfer --help
Usage: heroku pg:transfer

 transfer data between databases

 -f, --from DATABASE  # source database, defaults to DATABASE_URL on the app
 -t, --to   DATABASE  # target database, defaults to local $DATABASE_URL
```

## Download

`pg:transfer` has a very simple purpose - to transfer data from one Postgres db to another. As such it only requires two arguments, the source and target database locations (in its vernacular the "to" and "from").

If you're in the root folder of an app already deployed to Heroku the "from" and "to" will assumed to be at the location specified by the `DATABASE_URL` [config var](https://devcenter.heroku.com/articles/config-vars) on the remote app and the local environment variable `DATABASE_URL` for the local db, respectively. In other words, by default, `heroku pg:transfer` will export from your Heroku database and import into your local development database.

```bash
$ heroku pg:transfer
Source database: HEROKU_POSTGRESQL_BLACK (DATABASE_URL) on someapp.herokuapp.com
Target database: someapp on localhost:5432

 !    WARNING: Destructive Action
 !    This command will affect the app: someapp
 !    To proceed, type "someapp" or re-run this command with --confirm someapp

> someapp
pg_dump: reading schemas
pg_dump: reading user-defined tables
...
```

If the local database you want to import to isn't set in your environment you can quickly do so just for the `pg:transfer` command with the `env` utility,

```bash
$ env DATABASE_URL=postgres://localhost/someapp-dev heroku pg:transfer
```


Apps using [Foreman](http://ddollar.github.com/foreman/) for local process management can quickly provision the correct environment variables from the `.env` file with: `source .env &amp;&amp; heroku pg:transfer`.


## Upload

If you want to push data from your local environment to your Heroku database you'll need to specify the `to` and `from` flags to reverse the default direction of the transfer. For added convenience `pg:transfer` is aware of the Heroku Postgres `COLOR` naming scheme.

```bash
$ heroku config | grep POSTGRES
HEROKU_POSTGRESQL_JADE_URL: postgres://ads8a8d9asd:al82kdau78kja@ec2-23-23-237-0.compute-1.amazonaws.com:5432/resource123

$ heroku pg:transfer --from $DATABASE_URL --to jade --confirm someapp
...
```

## Transfer

While pushing data from a local db to a remote one is of limited usefulness a more common use-case is to transfer between two remote databases. For instance, populating a staging or test environment with production data.

To transfer data between databases on different applications specify the full connection info of the target database in the `--to` flag.

```bash
$ heroku pg:transfer --to `heroku config:get DATABASE_URL -a app-staging` --confirm someapp
Source database: HEROKU_POSTGRESQL_JADE on someapp.herokuapp.com
Target database: kai89akdkaoa on ec2-23-21-45-234.compute-1.amazonaws.com:5742

pg_dump: reading schemas
pg_dump: reading user-defined tables
...
```

Here the `heroku config:get` command is used to fetch the full PG connection info for the target app.

## Outside Heroku

Somewhat un-intuitively for a Heroku CLI plugin, you can also use `pg:transfer` to transfer data between two databases that are not associated with Heroku. Since the plugin accepts raw connection URLs for both the `--from` and the `--to` locations you're really not limited in how you use the feature.

As Postgres' fame grows more and more platforms are supporting the database. Transferring data between [Engine Yard Postgres databases](http://www.engineyard.com/blog/2012/postgresql-is-our-new-default/), between dbs on EY and Heroku, or from EY to your local database is simple. Though you need the `heroku` command on your path it's really quite agnostic.

To transfer from EY PG to your local database at the env var `DATABASE_URL`:

```bash
$ heroku pg:transfer --from "postgres://deploy:password@127.0.0.1:5433/dbname" --to $DATABASE_URL
```


To gain ingress to an EY Postgres database, follow the [SSH tunnel instructions here](https://support.cloud.engineyard.com/entries/21009887-access-your-database-remotely-through-an-ssh-tunnel). Hence the local `127.0.0.1` connection URL in this example.


The Heroku `pg:transfer` CLI plugin is a much more stable and flexible tool for migrating data between Postgres databases than the Taps gem and the corresponding `db:pull` or `db:push` commands. Use it to robustly manage data transfer between Postgres databases.