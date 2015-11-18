
[![Build Status](https://travis-ci.org/mattstyles/koa-socket.svg?branch=composer)](https://travis-ci.org/mattstyles/koa-socket)
[![npm version](https://badge.fury.io/js/koa-socket.svg)](https://badge.fury.io/js/koa-socket)
[![Coverage Status](https://coveralls.io/repos/mattstyles/koa-socket/badge.svg?branch=master&service=github)](https://coveralls.io/github/mattstyles/koa-socket?branch=master)
[![Dependency Status](https://david-dm.org/mattstyles/koa-socket.svg)](https://david-dm.org/mattstyles/koa-socket.svg)

# Koa-socket

> Sugar for connecting socket.io to a koa instance

**Koa-socket** is now compatible with koa v2, v0.4.0 of koa-socket is the last version to support koa v1.x. As such, `koa-socket` now requires **node v4.0.0** or higher and **koa v2.0.0** or higher.


## Installation

```sh
npm i -S koa-socket
```

## Example

```js
const Koa = require( 'koa' )
const IO = require( 'koa-socket' )

const app = new Koa()
const io = new IO()

app.use( ... )

io.attach( app )

io.on( 'join', ( ctx, data ) => {
  console.log( 'join event fired', data )
})

app.server.listen( process.env.PORT || 3000 )
```

## Features

* Attach socket.io to existing koa projects
* Attach koa-style middleware to socket.io events
* Supports koa v2 style of passing context along the response chain


## Attaching to existing projects

The `attach` function is used to attach the `IO` instance to the application, this adds `server` and `io` properties to the koa application and should happen before the app starts listening on a port.

The only change you need to make to your existing code is to start the server listening by calling `app.server.listen` rather than `app.listen` (you’ll get a console warning if you get it wrong ;) ).

```js
const Koa = require( 'koa' )
const IO = require( 'koa-socket' )

const app = new Koa()
const io = new IO()

// Attach the socket to the application
io.attach( app )

// Socket is now available as app.io if you prefer
app.io.on( event, eventHandler )

// Make sure the `app.server` instance starts listening on a port
app.server.listen( process.env.PORT || 3000 )
```


## Middleware and event handlers

Middleware can be added to sockets in much the same way as it is added to a koa instance, currently only generator functions can be used and they must be used in the same way that koa v2 uses them i.e. with `co.wrap`.

```js
const Koa = require( 'koa' )
const IO = require( 'koa-socket' )
const co = require( 'co' )

const app = new Koa()
const io = new IO()

app.use( ... )

io.use( co.wrap( function *( ctx, next ) {
  let start = new Date()
  yield next()
  console.log( `response time: ${ new Date() - start }ms` )
}))

io.use( ... );

io.on( 'message', ( ctx, data ) => {
  console.log( `message: ${ data }` )
})

io.attach( app )
app.server.listen( 3000 );
```


## Passed Context

```js
let ctx = {
  event: listener.event,
  data: data,
  socket: Socket
}
```

The context passed to each socket middleware and handler begins the chain with the event that triggered the response, the data sent with that event and the socket instance that is handling the event.

As the context is passed to each function in the response chain it is fair game for mutation at any point along that chain, it is up to you to decide whether this is an anti-pattern or not. There was much discussion around this topic for koa v2.


```js
io.use( co.wrap( function *( ctx, next ) {
  ctx.process = process.pid
  yield next()
}))

io.use( co.wrap( function *( ctx, next ) {
  // ctx is passed along so ctx.process is now available
  console.log( ctx.process )
}))

io.on( 'event', ( ctx, data ) => {
  // ctx is passed all the way through to the end point
  console.log( ctx.process )
})
```


## Namespaces

Namespaces can be defined simply by instantiating a new instance of `koaSocket` and passing the namespace id in the constructor. All other functionality works the same, it’ll just be constrained to the single namespace.

```js
const app = new Koa()
const chat = new IO({
  namespace: 'chat'
})

chat.attach( app )

chat.on( 'message', ctx => {
  console.log( ctx.data )
  chat.broadcast( 'response', ... )
})
```

Namespaces also attach themselves to the `app` instance, throwing an error if the property name already exists.

```js
const app = new Koa()
const chat = new IO({
  namespace: 'chat'
})

chat.attach( app )

app.chat.use( ... )
app.chat.on( ... )
app.chat.broadcast( ... )
```

The attachment is configurable if you don’t want to muddy the `app` object with all your namespaces.

```js
const chat = new IO({
  namespace: 'chat',
  hidden: true
})

chat.use( ... )
chat.on( ... )
```

Namespaces are fairly ubiquitous so they get a dirty shorthand for creating them, note that if you want to add any additional options you’ll need to use the longhand object parameter to instantiate `koaSocket`.

```js
const chat = new IO( 'chat' )
```


## API

### .attach( `Koa app` )

Attaches to a koa application

```js
io.attach( app )
app.server.listen( process.env.PORT )
```

### .use( `Function callback` )

Applies middleware to the stack.

Middleware are executed each time an event is heard and before the callback is triggered for events.

Middleware with generators should use `co.wrap`.

Middleware functions are called with `ctx` and `next`. The context is passed through each middleware and out to the event listener callback. `next` allows the middleware chain to be traversed—use of generators provides and upstream and a downstream allowing for an expressive middleware stack.


```js
io.use( co.wrap( function *( ctx, next ) {
  console.log( 'Upstream' )
  yield next()
  console.log( 'Downstream' )
}))
```

### .on( `String event`, `Function callback` )

Attaches a callback to an event.

The callback is fired after any middleware that are attached to the instance and is called with the `ctx` object and the `data` that triggered the event. The `data` can also be found on the `ctx`, the only potential difference is that `data` is the raw `data` emitted with the event trigger whilst `ctx.data` could have been mutated within the middleware stack.

```js
io.on( 'join', ( ctx, data ) => {
  console.log( data )
  console.log( ctx.data, data )
})
```

### .off( `String event`, `Function callback` )

Removes a callback from an event.

If the `event` is omitted then it will remove all listeners from the instance.

If the `callback` is omitted then all callbacks for the supplied event will be removed.

```js
io.off( 'join', onJoin )
io.off( 'join' )
io.off()
```

### .broadcast( `String event`, `data` )

Sends a message to all connections.


## Running tests

```sh
npm test
```

## License

MIT
