# Higher Order Heroku

[Higher Order Heroku](http://www.higherorderheroku.com/) is a collection of articles outlining the latest tools and techniques of developing on Heroku.

## Running locally

Higher Order Heroku uses [Middleman](http://middlemanapp.com/), a Ruby-based static site generator, to render the site in development mode. Get Higher Order Heroku running locally with the following steps:

1. `git clone git://github.com/pdsphil/higherorderheroku.com.git && cd higherorderheroku.com`
2. `bundle install`
3. `middleman`
4. open `http://localhost:4567`

## Deployment

Though it is a static site, Higher Order Heroku runs on Heroku and utilizes the [multi-buildpack](http://github.com/ddollar/heroku-buildpack-multi) to chain the [middleman buildpack](http://github.com/meskyanichi/heroku-buildpack-middleman) and [nginx buildpack](http://github.com/essh/heroku-buildpack-nginx). This allows site generation to occur when you do a `git push heroku master` and serves the content via the very fast nginx.

To deploy your own Higher Order Heroku:

1. `git clone git://github.com/pdsphil/higherorderheroku.com.git && cd higherorderheroku.com`
2. `heroku create --buildpack git://github.com/ddollar/heroku-buildpack-multi.git`
3. `heroku config:set HOST=mysite.com`
3. `git push heroku master`
4. `heroku open`
# rails_and_angular_example
