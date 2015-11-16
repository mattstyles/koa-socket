
[![Build Status](https://travis-ci.org/mattstyles/koa-socket.svg?branch=composer)](https://travis-ci.org/mattstyles/koa-socket)

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

io.on( 'event', ( ctx, packet ) => {
  // ctx is passed all the way through to the end point
  console.log( ctx.process )
})
```

## Running tests

```sh
npm test
```

## License

MIT
