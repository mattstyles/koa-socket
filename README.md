# Koa-socket

> Sugar for connecting socket.io to a koa instance

**Koa-socket** is now compatible with koa v2, v0.4.0 of koa-socket is the last version to support koa v1.x. As such, `koa-socket` now requires **node v4.0.0** or higher.


## Installation

```sh
npm i -S koa-socket
```


## Example

```js
var Koa = require( 'koa' )
var socket = require( 'koa-socket' )

var app = new Koa()

app.use( ... )

socket.start( app )

socket.on( 'join', ( ctx, packet ) => {
  console.log( 'join event fired', packet )
})

app.server.listen( process.env.PORT || 3000 )
```

## Features

* Attach socket.io to existing koa projects
* Attach koa-style middleware to socket.io events
* Supports koa v2 style of passing context along the response chain


## Attaching to existing projects

The `start` function is used to attach the `socket` instance to the application, this adds `server` and `io` properties to the koa application and should probably happen before the app starts listening on a port.

The only change you need to make to your existing code is to start the server listening by calling `app.server.listen` rather than `app.listen`.

```js
var Koa = require( 'koa' )
var socket = require( 'koa-socket' )

var app = new Koa()

// Attach the socket to the application
socket.start( app )

// Socket is now available as app.io if you prefer
app.io.on( event, eventHandler )

// Make sure the `app.server` instance starts listening on a port
app.server.listen( process.env.PORT || 3000 )
```


## Middleware and event handlers

Middleware can be added to sockets in much the same way as it is added to a koa instance, currently only generator functions can be used and they must be used in the same way that koa v2 uses them i.e. with `co.wrap`.

```js
var Koa = require( 'koa' )
var co = require( 'co' )
var socket = require( 'koa-socket' )

var app = new Koa()

app.use( ... )

socket.use( co.wrap( function *( ctx, next ) {
  var start = new Date()
  yield next()
  console.log( `response time: ${ new Date() - start }ms` )
}))

socket.use( ... );

socket.on( 'message', ( ctx, packet ) => {
  console.log( `message: ${ packet }` )
})

socket.start( app )
app.server.listen( 3000 );
```


## Passed Context

```js
var ctx = {
  event: listener.event,
  data: data,
  socket: socket
}
```

The context passed to each socket middleware and handler begins the chain with the event that triggered the response, the data sent with that event and the raw socket connection that is handling the event.

As the context is passed to each function in the response chain it is fair game for mutation at any point along that chain, it is up to you to decide whether this is an anti-pattern or not. There was much discussion around this topic for koa v2.


```js
socket.use( co.wrap( function *( ctx, next ) {
  ctx.process = process.pid
  yield next()
}))

socket.use( co.wrap( function *( ctx, next ) {
  // ctx is passed along so ctx.process is now available
  console.log( ctx.process )
}))

socket.on( 'event', ( ctx, packet ) => {
  // ctx is passed all the way through to the end point
  console.log( ctx.process )
})
```


## License

MIT
