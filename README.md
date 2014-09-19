# Koa-socket

> Sugar for connecting socket.io to a koa instance

## Installation

```
npm i --save koa-socket
```

## Example

```
var koa = require( 'koa' );
var socket = require( 'koa-socket' );

var app = koa();

app.use( ... );

socket.start( app );

socket.on( 'join', function( data ) {
  console.log( 'join event fired', data );
});

app.server.listen( process.env.PORT || 3000 );
```

## Middleware and event handlers

Middleware can be added to sockets in much the same way as it is added to a koa instance.

```
var app = require( 'koa' )();
var socket = require( 'koa-socket' );

app.use( ... );

socket.use( function *( next ) {
  var start = new Date();

  yield next;
  console.log( 'elapsed:', new Date() - start );
});

socket.use( ... );

app.server.listen( 3000 );
```

Middleware context references both the data sent along with the socket event and the socket itself.

```
// From the client
socket.emit( 'event', {
  ua: navigator.userAgent,
  time: new Date()
});

// Listening on the server
socket.on( 'event', function( packet ) {
  // Id now exists on the packet thanks to middleware
  // Although in this trivial example it can be referenced on the context
  console.log( packet.id );
  console.log( this.id );
});

socket.use( function *( next ) {
  // This will fail
  console.log( this.data.id );

  yield next;

  // It'll work here though
  console.log( this.data.id );
});

socket.use( function *( next ) {
  this.data.id = this.socket.id;
});
```

In the above example the event handler will get executed after the middleware and the context is shifted so that `this` references the socket and its data is passed as the `packet` parameter.


## License

ISC
