---
title: Configuring CloudFlare DNS for a Heroku App
date: November 9, 2012
---

[CloudFlare](http://cloudflare.com) is a popular, and accessible, CDN and website optimizer. If you've heard of Akamai then you know basically what CloudFlare does -- they sit between your site and your users and accelerate your site's content by edge-caching and other nifty on-the-fly techniques. CloudFlare also offers additional availability and security features to automatically handle DDoS and other real-world problems.

[Heroku](http://www.heroku.com) needs no introduction other than to say it's the best place to deploy your applications.

So, how do you get the benefits of CloudFlare for your Heroku application? Until CloudFlare provides a [Heroku add-on](https://addons.heroku.com/) there's a bit of manual configuration that needs to occur.


For the purpose of this post I'm assuming you already have a CloudFlare account and an existing Heroku app.


## Initial setup

Since CloudFlare needs to be able to handle DDoS and other traffic-related events on your behalf, it must serve as your DNS. When you add a new website to CloudFlare it will scan your existing DNS records and duplicate them in the CloudFlare DNS.

![Initial DNS configuration](http://f.cl.ly/items/0E0A1b0L341Z2r2R3K0I/Image%202012-11-08%20at%203.51.40%20PM.png)

While this is a great way to quickly bootstrap your DNS, it implements the [DNS anti-pattern of using A-records](https://devcenter.heroku.com/articles/avoiding-naked-domains-dns-arecords) to resolve to a dynamically determined IP address.

Under the covers Heroku uses multiple IP addresses. Choosing just one to bind to is a dangerous practice that can adversely affect your app's availability. In short, you should never use A-records in your DNS on Heroku because those static IP addresses can change at any time and represent a single point of failure.

Avoid the use of A-records and root domains (`ryandaigle.com` is a root domain whereas `www.ryandaigle.com` is not) by redirecting all root domain `ryandaigle.com` requests to `www.ryandaigle.com`.

## Root domain redirect

Setting up a URL redirect (or "forward" in many DNS providers' parlance) on CloudFlare requires that you go into the "Page rules" for your site.

From your [CloudFlare websites list](https://www.cloudflare.com/my-websites) click on the gears icon for your site and select "Page rules".

![Website settings](http://cl.ly/image/2A1R2V2a2D2k/Image%202012-11-08%20at%203.57.57%20PM.png)


If you don't see "Page rules" as an option your site may not be fully configured. Complete the CloudFlare setup first or go to the CloudFlare settings page and under "Cache Purge" you will see a link to "Page rules".


Enter the root domain for your site and the `www` (or other) sub-domain to redirect to. Append a `*` wildcard pattern to the root domain and the `$1` regex to the sub-domain so all requests made to the root domain are properly forwarded (e.g. `ryandaigle.com/a/mypage` will get forward to `www.ryandaigle.com/a/mypage`). You'll need to turn "on" the forwarding toggle to see the sub-domain field.

![Forwarding rule](http://cl.ly/image/0a212W0D3a11/Image%202012-11-08%20at%204.02.49%20PM.png)

Make sure you include the `http://` part of the sub-domain URL. Click "Add rule" to save the forward.

## Sub-domains

If CloudFlare wasn't able to retrieve your existing DNS settings, or you have a new Heroku app, you'll need to make sure you have the proper CNAME DNS entries.

Map the `www` sub-domain to your Heroku app URL (`appname.herokuapp.com`) using a `CNAME` record.

![CNAME entry](http://cl.ly/image/1j1o2u0y3a2p/Image%202012-11-08%20at%204.11.25%20PM.png)

## Confirmation

To confirm your setup, first verify that your root domain redirects to the sub-domain. Use the `curl` utility to verify the redirect.

```bash
$ curl -I ryandaigle.com
HTTP/1.1 301 Moved Permanently
...
Location: http://www.ryandaigle.com/
```

You should see a `301 Moved Permanently` response code and the proper sub-domain URL in the `Location` header.

As you may already know, troubleshooting DNS is notoriously difficult given the propagation lag. In my testing it took about an hour for new CloudFlare DNS settings to take effect (and this is *after* CloudFlare's name servers are active for your site).


After confirming the redirect you should also confirm that a sub-domain request passes through the CloudFlare system. Do this with a `curl` against the `www` sub-domain.

```bash
$ curl -I www.ryandaigle.com
HTTP/1.1 200 OK
Server: cloudflare-nginx
...
Set-Cookie: __cfduid=askdjfalk8a98a9sd8fa9sda9jkar8; expires=Mon, 23-Dec-2019 23:50:00 GMT; path=/; domain=.ryandaigle.com
```

You can identify a CloudFlare-handled request by two response headers: the `Server` being set to `cloudflare-nginx` and a `__cfduid` cookie. If you see these two headers in the response then CloudFlare is properly handling your request. For my domain it took several hours to see these headers appear, so sleep on it if you're not seeing this after configuring the DNS.

## Conclusion

Once these DNS changes have propagated you might think it would be safe to remove the A-record. However, in my testing, **you still need to keep the A-record listed in your CloudFlare DNS config** or your hostname won't resolve. The forwarding rule still works as desired and bypasses the A-record IP address but there must be an A-record listed.


If you don't have an A-record already, add one from `@` (the root domain notation) to one of the following IPs: `75.101.163.44`, `75.101.145.87`, `174.129.212.2`.


At this point all requests to your root domain will be forwarded to their `www` equivalent which properly resolves to one of Heroku's dynamically determined IP addresses. This is the appropriate setup for Heroku, and is the most robust configuration for any cloud-based environment.

Now that your DNS is properly configured I'd suggest browsing the CloudFlare app store and your site's CloudFlare settings for all the cool toys and switches you now have at your disposal. They also have a [good blog post for new users](http://blog.cloudflare.com/cloudflare-tips-recommended-steps-for-new-use).