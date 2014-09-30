---
title: Configuring CloudFlare DNS for a Heroku App
date: November 9, 2012
---

*This article was updated on Sep. 30, 2014 to reflect CloudFlare's new CNAME flattening capability*

[CloudFlare](http://cloudflare.com) is a popular, and accessible, CDN and website optimizer. If you've heard of Akamai then you know basically what CloudFlare does -- they sit between your site and your users and accelerate your site's content by edge-caching and other nifty on-the-fly techniques. CloudFlare also offers additional availability and security features to automatically handle DDoS and other real-world problems.

[Heroku](http://www.heroku.com) needs no introduction other than to say it's the best place to deploy your applications.

So, how do you get the benefits of CloudFlare for your Heroku application? Until CloudFlare provides a [Heroku add-on](https://addons.heroku.com/) there's a bit of manual configuration that needs to occur.

For the purpose of this post I'm assuming you already have a CloudFlare account and an existing Heroku app.


## Initial setup

Since CloudFlare needs to be able to handle DDoS and other traffic-related events on your behalf, it must serve as your DNS. When you add a new website to CloudFlare it will scan your existing DNS records and duplicate them in the CloudFlare DNS.

![Initial DNS configuration](http://f.cl.ly/items/0E0A1b0L341Z2r2R3K0I/Image%202012-11-08%20at%203.51.40%20PM.png)

While this is a great way to quickly bootstrap your DNS, it might result in the use of A-records to resolve your root domain (which is a [Heroku anti-pattern](https://devcenter.heroku.com/articles/avoiding-naked-domains-dns-arecords)). Under the covers Heroku uses multiple IP addresses. Choosing just one to bind to is a dangerous practice that can adversely affect your app's availability. In short, you should never use A-records in your DNS on Heroku because those static IP addresses can change at any time and represent a single point of failure.

The proper setup is to use CloudFlare's [CNAME flattening](http://blog.cloudflare.com/introducing-cname-flattening-rfc-compliant-cnames-at-a-domains-root/) feature to dynamically resolve requests for the root domain (`ryandaigle.com` is a root domain whereas `www.ryandaigle.com` is not).

## Root domains

With CNAME flattening, resolution requests for the root domain return a single IP address (as is required of A-records) determined at the time of the request. However, each resolution request can return a different IP, so you haven't bound yourself to a single point of failure. It represents the best combination of CNAME and A-records.

If you're not already on the DNS page for your domain, choose the "DNS Settings" option for the domain in question from your list of sites.

![](http://f.cl.ly/items/3C2J3Z0l2n0N0R1q3t3y/Image%202014-09-30%20at%2012.26.40%20PM.png)

To use CNAME flattening on CloudFlare for your root domain, just add a CNAME record pointing from your root domain to your app on Heroku.

![](http://f.cl.ly/items/2U1l1k1x46462q1L3A1h/Image%202014-09-30%20at%2012.30.16%20PM.png)

On adding the record, it will be recognized as a CNAME record at the root domain and flattening will be in effect.

![](http://f.cl.ly/items/3A0p1U430p3q0B3x251N/Image%202014-09-30%20at%2012.32.04%20PM.png)

At this point, requests to the root domain will be properly resolved to one of the many Heroku IP addresses currently in rotation and your root is properly configured.

## Sub-domains

If you have sub-domains you want your Heroku app to also server, you'll need to make sure you have the proper CNAME DNS entries.

For instance, map the `www` sub-domain to your Heroku app URL (`appname.herokuapp.com`) using a `CNAME` record.

![CNAME entry](http://cl.ly/image/1j1o2u0y3a2p/Image%202012-11-08%20at%204.11.25%20PM.png)

## Confirmation

To confirm your setup, verify that all requests are being resolved by CloudFlare. The easiest way to do this is to inspect the HTTP headers using the `curl` command.

```bash
$ curl -I ryandaigle.com
HTTP/1.1 200 OK
Server: cloudflare-nginx
...
Set-Cookie: __cfduid=askdjfalk8a98a9sd8fa9sda9jkar8; expires=Mon, 23-Dec-2019 23:50:00 GMT; path=/; domain=.ryandaigle.com
```

You can identify a CloudFlare-handled request by two response headers: the `Server` being set to `cloudflare-nginx` and a `__cfduid` cookie. If you see these two headers in the response then CloudFlare is properly handling your request.

Do this for the root domain as well as any sub-domains you configured in CloudFlare.

As you may already know, troubleshooting DNS is notoriously difficult given the propagation lag. In my testing it took about an hour for new CloudFlare DNS settings to take effect (and this is *after* CloudFlare's name servers were active for my site).

Now that your DNS is properly configured I'd suggest browsing the CloudFlare app store and your site's CloudFlare settings for all the cool toys and switches you now have at your disposal. They also have a [good blog post for new users](http://blog.cloudflare.com/cloudflare-tips-recommended-steps-for-new-use).
