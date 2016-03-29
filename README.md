
[![Build Status](https://travis-ci.org/mattstyles/koa-socket.svg?branch=composer)](https://travis-ci.org/mattstyles/koa-socket)
[![npm version](https://badge.fury.io/js/koa-socket.svg)](https://badge.fury.io/js/koa-socket)
[![Coverage Status](https://coveralls.io/repos/mattstyles/koa-socket/badge.svg?branch=master&service=github)](https://coveralls.io/github/mattstyles/koa-socket?branch=master)
[![Dependency Status](https://david-dm.org/mattstyles/koa-socket.svg)](https://david-dm.org/mattstyles/koa-socket.svg)

# Koa-socket

> Sugar for connecting socket.io to a koa instance

**Koa-socket** is now compatible with koa v2 style of middleware (where context is passed as a parameter), v0.4.0 of koa-socket is the last version to support the old style of middleware.

As such, koa-socket now requires **node v4.0.0** or higher although koa-socket simply attaches to the server instance so will be compatible with a koa v1 powered app.


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

app.listen( process.env.PORT || 3000 )
```

## Features

* Attach socket.io to existing koa projects
* Attach koa-style middleware to socket.io events
* Supports koa v2 style of passing context along the response chain


## Attaching to existing projects

The `attach` function is used to attach the `IO` instance to the application, this adds `server`\* and `io` properties to the koa application and should happen before the app starts listening on a port.

It also re-maps `app.listen` to `app.server.listen`, so you could simply do `app.listen()`. However if you already had an `app.server` attached, it uses it instead and expects you to do `app.server.listen()` yourself.

```js
const Koa = require( 'koa' )
const IO = require( 'koa-socket' )

const app = new Koa()
const io = new IO()

// Attach the socket to the application
io.attach( app )

// Socket is now available as app.io if you prefer
app.io.on( event, eventHandler )

// The raw socket.io instance is attached as app._io if you need it
app._io.on( 'connection', sock => {
  // ...
})

// app.listen is mapped to app.server.listen, so you can just do:
app.listen( process.env.PORT || 3000 )

// *If* you had manually attached an `app.server` yourself, you should do:
app.server.listen( process.env.PORT || 3000 )
```

## Middleware and event handlers

Middleware can be added in much the same way as it can be added to any regular koa instance.

### Example with *async* functions (transpilation required)

```js
io.use( async ( ctx, next ) => {
  let start = new Date()
  await next()
  console.log( `response time: ${ new Date() - start }ms` )
})
```

There is an example in the `examples` folder, use `npm run example-babel` to fire it up. The npm script relies on the `babel` require hook, which is not recommended in production.


### Example with generator functions

Koa v2 no longer supports generators so if you are using v2 then you must use `co.wrap` to have access to the generator style.

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
app.listen( 3000 );
```

### Plain example

Whilst slightly unwieldy, the standalone method also works

```js
io.use( ( ctx, next ) => {
  let start = new Date()
  return next().then( () => {
    console.log( `response time: ${ new Date() - start }ms` )
  })
})
```


## Passed Context

```js
let ctx = {
  event: listener.event,
  data: data,
  socket: Socket,
  acknowledge: cb
}
```

The context passed to each socket middleware and handler begins the chain with the event that triggered the response, the data sent with that event and the socket instance that is handling the event. There is also a shorthand for firing an acknowledgement back to the client.

As the context is passed to each function in the response chain it is fair game for mutation at any point along that chain, it is up to you to decide whether this is an anti-pattern or not. There was much discussion around this topic for koa v2.


```js
io.use( async ( ctx, next ) => {
  ctx.process = process.pid
  await next()
})

io.use( async ( ctx, next ) => {
  // ctx is passed along so ctx.process is now available
  console.log( ctx.process )
})

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
app.listen( process.env.PORT )
```

### .use( `Function callback` )

Applies middleware to the stack.

Middleware are executed each time an event is reacted to and before the callback is triggered for an event.

Middleware with generators should use `co.wrap`.

Middleware functions are called with `ctx` and `next`. The context is passed through each middleware and out to the event listener callback. `next` allows the middleware chain to be traversed. Under the hood `koa-compose` is used to follow functionality with `koa`.


```js
io.use( async ( ctx, next ) {
  console.log( 'Upstream' )
  await next()
  console.log( 'Downstream' )
})
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
