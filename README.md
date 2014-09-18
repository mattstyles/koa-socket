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

socket.on( 'join', function( data ) {
  console.log( 'join event fired', data );
});

var server = require( 'http' ).createServer( app.callback() );
var io = require( 'socket.io' )( server );

io.on( 'connection', function( sock ) {
  console.log( 'Socket connected', sock.id );
  socket.attach( sock );
});

server.listen( process.env.PORT || 3000 );
```

## License

ISC
