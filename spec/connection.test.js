
'use strict';

const fork = require( 'child_process' ).fork
const tape = require( 'tape' )
const IO = require( '../' )

const application = require( './helpers/utils' ).application
const connection = require( './helpers/utils' ).connection

function forkConnection( srv ) {
  return fork( __dirname + '/helpers/connect', [
    '--port', srv.address().port
  ])
}


tape( 'Client connects to server', t => {
  t.plan( 1 )

  const socket = new IO()
  const client = connection( application( socket ).server )

  client.on( 'connect', () => {
    client.disconnect()
  })
  socket.on( 'disconnect', ctx => {
    t.pass( 'connect-disconnect cleanly' )
  })
})

tape( 'Number of connections should update when a client connects', t => {
  t.plan( 3 )

  const socket = new IO()
  const app = application( socket )
  const client = connection( app.server )

  t.equal( socket.connections.size, 0, 'socket connections should start at 0' )

  socket.on( 'connection', ctx => {
    t.equal( socket.connections.size, 1, 'one connections should be one connection' )
    ctx.socket.disconnect()
  })
  client.on( 'disconnect', ctx => {
    t.equal( socket.connections.size, 0, 'after a disconnect there should be 0 again' )
  })
})

tape( 'Number of connections should reflect multiple connectees', t => {
  t.plan( 2 )

  const socket = new IO()
  const app = application( socket )

  app.server.listen()

  t.equal( socket.connections.size, 0, 'socket connections should start at 0' )

  const c1 = forkConnection( app.server )
  const c2 = forkConnection( app.server )

  // Give them 500ms to connect, that'll be more than enough and makes life simpler
  setTimeout( () => {
    t.equal( socket.connections.size, 2, '2 connectors should mean 2 number of connections' )
    c1.send({ action: 'disconnect' })
    c2.send({ action: 'disconnect' })
    app.server.close()
  }, 500 )
})

tape( 'A specific connection can be picked from the list of active connections', t => {
  t.plan( 1 )

  const socket = new IO()
  const app = application( socket )

  app._io.on( 'connection', sock => {
    t.equal( socket.connections.has( sock.id ), true, 'The socket ID is contained in the connections map' )
    sock.disconnect()
  })

  const client = connection( app.server )
})

tape( 'The connection list can be used to boot a client', t => {
  t.plan( 2 )

  const socket = new IO()
  const app = application( socket )

  app._io.on( 'connection', sock => {
    t.equal( socket.connections.size, 1, 'The connected client is registered' )
  })

  const client = connection( app.server )

  client.on( 'disconnect', ctx => {
    t.equal( socket.connections.size, 0, 'The client has been booted' )
  })


  // Do it some time in the future, and do it away from the connection socket instance
  setTimeout( () => {
    // use /# as id's are socket.io ids are now namespace + '#' + clientID
    let sock = socket.connections.get( '/#' + client.id )
    sock.socket.disconnect()
  }, 500 )
})

tape( 'A connection handler can be applied to the koaIO instance', t => {
  t.plan( 1 )

  const socket = new IO()
  const app = application( socket )
  const srv = app.server.listen()

  const client = connection( srv )

  socket.on( 'connection', ctx => {
    t.pass( 'The socket connection handler is fired' )
    ctx.socket.disconnect()
  })

})
