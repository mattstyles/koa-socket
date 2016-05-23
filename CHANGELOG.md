
## 4.4.0 - 23.05.2016

* _update_ return server instance [farmisen](https://github.com/farmisen)
* _update_ examples

## 4.3.0 - 29.03.2016

* _add_ `socket.broadcast` helper for broadcast emit

## 4.2.0 - 29.02.2016

* _update_ patch `app.listen` [laggingreflex](https://github.com/laggingreflex)

## 4.1.0

* _update_ use an http server if one already exists [laggingreflex](https://github.com/laggingreflex)

## 4.0.0 - 18.01.2016

* _add_ allow passing options to socket.io instance
* _update_ attach raw socket.io instance
* _update_ attach IO instance for default namespace
* _fix_ use new socket.io identifier type
* _update_ dependencies
* _fix_ attach IO instance and not the raw socket for namespaced instances

### Breaking changes

* koaSocket now attaches instances of itself to the `app`, whereas previously it attaches the socket.io instance. This facilitates accessing `koaSocket` instances from any `app` middleware without having to pass it around as a dependency, the raw socket.io instance is still available as `koaSocket.socket`.
* The raw socket.io instance is now attached as `._io`, whilst the default namespace becomes `.io` if it exists.
* Made it explicit that `koaSocket` only supports node v4 as its lowest version.


## 3.2.0 - 18.11.2015

* _add_ namespace support
* _add_ configure namespaces attaching to the app using `hidden`
* _add_ 1-arity constructor

## 3.1.0 - 16.11.2015

* _add_ allow runtime updates to middleware and listeners
* _update_ test coverage
* _add_ remove event listeners

## 3.0.0 - 16.11.2015

* _update_ use class notation
* _update_ performance improvements by composing middleware in the socket constructor rather than every event
* _add_ broadcast to all connections
* _add_ test sling
* _update_ throw error on failure to attach socket to koa

### Breaking changes

* koaSocket exposes an IO class, which must be instantiated. This is the same as instantiating a koa v2 app.
* `start` is renamed to `attach`. `Start` is misleading, more so than `attach` which at least does attach socket.io to a koa-callback-powered listener.
* The context packet returned with each event now contains a Socket instance, rather than just the raw socket.io socket


## 2.0.0 - 11.11.2015

* _add_ koa v2 compatibility
* _update_ middleware composition

### Breaking changes

* Middleware should now be passed `co` wrapped generators, similar to one method of using koa.
* Context is shifted from `this` to the `ctx` parameter, which is passed through middleware to event listeners and is mutable.


## 0.4.0 - 30.04.2015

* _add_ - event to data packet - *[git-jiby-me](https://github.com/git-jiby-me)*

## 0.3.0 - 20.09.2014

* _add_ - explicit on and off connection callbacks
* _fix_ - disconnect handler only once

## 0.2.0 - 19.09.2014

* _add_ - list of open connections
* _add_ - remove a connection
* _add_ - allow creation of middleware chain
* _add_ - start server convenience function
* _add_ - expose connected socket

## 0.1.0 - 18.09.2014

* _add_ - wrapper around attaching listeners to a socket instance
