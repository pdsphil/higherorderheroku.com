---
title: Micro-services Off the Starting Blocks? - Part II
date: October 2, 2015
---

## Acknowledgments and Design Considerations
When I first started the research for this article, I was unfamiliar with what the current best practice was around integrating AgularJS with a Rails application.  I  could have use one of the Gems that integrate AngularJS with Rails, but I didn't want a Rails application with an embedded AngularJS front-end.  Most of the architectures that I consult on have an API component and a front-end component.  I didn't want to entangle the UI with the API. I did wish to deploy the application initially in one shot, but retain the option to pull things apart into a more traditional looking micro-architecture down the line.

I want to give a shout out to a fellow by the name of Jason Swett who did a good article that explained the basic approach that I ended up using as a starting point.  [His article can be found here.](http://www.angularonrails.com/how-to-wire-up-ruby-on-rails-and-angularjs-as-a-single-page-application-gulp-version/)  One of the things that can be frustrating with this stuff, the javascript frameworks in particular, is that it's moving so darned fast!  There were some things that needed updating and a careful piecing together.  Also, the approach to deploying onto Heroku was dated.  So starting with Jason's fine article as a base, I was able to coble things together into a slightly more up-to-date tutorial.  I'm sure this "freshness" will last two weeks, max! :)

If you're hyper Type-A and want to jump directly to the code, this project's [GitHub Repository is here](https://github.com/pbraswell/rails_and_angular_example).  This application is also live and deployed on [Heroku here.](https://peaceful-mountain-3274.herokuapp.com/)


### The Parts and Pieces
First, because I wasn't going to be using the RoR mark-up and other front-end goodness, I would prefer not to drag it along with me on this trip.  To this end, I decided to go with just the back-end pieces by leveraging [Rails-API](https://github.com/rails-api/rails-api).  Installation and bootstrapping the application is easy:

```bash
gem install rails-api
rails-api new contacts
```

I'll leave it to you to accomplish the next few steps.  In general, we just need to add a user to the database and do the initial setup like so:

```bash
bundle install
rake db:create
```

If you'd like to install any testing framwork, now would be the time to do that.  I tend to use Rspec and the install is pretty easy.  Jason goes into a little more depth into installing Rspec and making it behave a little less loudly by creating less skeleton tests in the context of Rails-API.  You don't need the helpers and ui-oriented Rsecs like you'd normally have for a more conventional Rails app.

You can look at my model for this application.  Essentially this is a 'Contacts' app that has a as-you-would-expect model for a contact.  There's nothing special and I'm assuming the reader knows how to use Rails' generators to create models and controllers.

The routes should look API-ish, so edit your routes file and make it look something like this:

```ruby
Rails.application.routes.draw do
  scope '/api' do
    resource :contacts
  end
end
```
Next I set up a seed file to get some test data into the system.  That's pretty simple and relies on ['Faker'](https://github.com/stympy/faker) to gen some real-ish looking test data.  Here's my "seed" file:

```ruby
require 'faker'

Contact.delete_all
for contacts in 1..10 do
	Contact.create(name: Faker::Name.name,
		phone: Faker::PhoneNumber.phone_number,
		address: Faker::Address.street_address,
	    email: Faker::Internet.email,
	    website: Faker::Internet.url,
	    notes: Faker::Lorem.words(5))
end
```
To seed and get things operational,

```bash
bundle exec rake db:seed
bundle exec rails s
```

Now, assuming the server came up and you have database connectivity, you should be able to :

```bash
curl localhost:3000/api/contacts
[{"id":5,"name":"Josefa Lehner","phone":"(439) 074-4010 x895","address":"442 Klein Hill","email":"delbert_ritchie@abernathymedhurst.io",.....
```

Congratulations!  You've just assembled all of the back-end pieces of our application!  Pretty easy huh?  I'm not going to bother showing how to get this piece deployed to Heroku and the end-game is to get the AngularJS AND the RoR piece deployed in one pass.  That's the interesting part!  It's pretty easy to get the back-end piece deployed and I'll leave that as an exercise for the reader should you be interested in doing that. Next installment, I'll detail how to assembled the embedded client part fashioned from AngularJS + grunt and other goodness.  I'll also wrap things up by showing a few tricks to getting everything to deploy properly on Heroku and then we'll be off to the races!

Until next time!







