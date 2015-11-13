
import tape from 'tape'
import Koa from 'koa'
import ioc from 'socket.io-client'
import socket from '../lib'


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

function server() {
  const app = new Koa()
  socket.start( app )
  return app.server
}


tape( 'Client connects to server', t => {
  t.plan( 1 )

  const client = connect( server() )

  client.on( 'connect', () => {
    client.disconnect()
  })
  socket.on( 'disconnect', socket => {
    t.pass( 'connect-disconnect cleanly' )
  })
})

tape.skip( 'Number of connections should reflect the number of client connections', t => {
  t.plan( 3 )

  t.equal( socket.numConnections, 0, 'socket connections should start at 0' )

  const client = connect( server() )

  function onConnection( sock ) {
    t.equal( socket.numConnections, 1, 'one connections should be one connection' )
    sock.disconnect()
  }

  function onDisconnect( sock ) {
    t.equal( socket.numConnections, 0, 'after a disconnect there should be 0 again' )
  }

  socket.on( 'connection', onConnection )
  socket.on( 'disconnect', onDisconnect )

  // @TODO not being able to instantiate multiple socket instances is a pain
  socket.off( 'connection', onConnection )
  socket.off( 'disconnect', onDisconnect )
})

/**
 * @TODO cant take off the listeners added in the previous test!
 */
tape.skip( 'Number of connections should reflect multiple connectees', t => {
  t.plan( 2 )
  t.equal( socket.numConnections, 0, 'socket connections should start at 0' )

  const srv = server()

  const c1 = connect( srv )
  const c2 = connect( srv )

  // Give them 500ms to connect, that'll be more than enough and makes life simpler
  setTimeout( () => {
    t.equal( socket.numConnections, 2, '2 connectors should mean 2 number of connections' )
  })
})
