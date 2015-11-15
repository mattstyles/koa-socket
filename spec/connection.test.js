
'use strict';

const tape = require( 'tape' )
const ioc = require( 'socket.io-client' )
const Koa = require( 'koa' )
const Socket = require( '../' )

// Attaches socket.io to a server
function connect( srv, opts ) {
  opts = Object.assign({
    transports: [ 'websocket' ]
  }, opts )
  let addr = srv.address()
  if ( !addr ) {
    addr = srv.listen().address()
  }
  let client = ioc( 'ws://0.0.0.0:' + addr.port, opts )
  client.on( 'disconnect', () => {
    srv.close()
  })
  return client
}

function application( sock ) {
  const app = new Koa()
  const socket = sock || new Socket()
  socket.attach( app )
  return app
}


tape( 'Client connects to server', t => {
  t.plan( 1 )

  const socket = new Socket()
  const client = connect( application( socket ).server )

  client.on( 'connect', () => {
    client.disconnect()
  })
  socket.on( 'disconnect', socket => {
    t.pass( 'connect-disconnect cleanly' )
  })
})

tape( 'Number of connections should reflect the number of client connections', t => {
  t.plan( 3 )

  const socket = new Socket()
  const app = application( socket )
  const client = connect( app.server )

  t.equal( socket.connections.size, 0, 'socket connections should start at 0' )

  function onConnection( sock ) {
    t.equal( socket.connections.size, 1, 'one connections should be one connection' )
    sock.disconnect()
  }

  function onDisconnect( sock ) {
    t.equal( socket.connections.size, 0, 'after a disconnect there should be 0 again' )
  }

  app.io.on( 'connection', onConnection )
  socket.on( 'disconnect', onDisconnect )

  // @TODO tidy up?
  // socket.off( 'connection', onConnection )
  // socket.off( 'disconnect', onDisconnect )
})

/**
 * @TODO
 */
tape.skip( 'Number of connections should reflect multiple connectees', t => {
  t.plan( 2 )

  const socket = new Socket()
  const app = application( socket )

  t.equal( socket.connections.size, 0, 'socket connections should start at 0' )

  const c1 = connect( app.server )
  const c2 = connect( app.server )

  // Give them 500ms to connect, that'll be more than enough and makes life simpler
  setTimeout( () => {
    t.equal( socket.connections.size, 2, '2 connectors should mean 2 number of connections' )
  }, 500 )
})
