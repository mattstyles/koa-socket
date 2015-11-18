
'use strict';

const tape = require( 'tape' )
const Koa = require( 'koa' )
const ioc = require( 'socket.io-client' )
const IO = require( '../' )

const application = require( './helpers/utils' ).application
const connection = require( './helpers/utils' ).connection

tape( 'socket.start alters the app to include socket.io', t => {
  t.plan( 2 )

  const app = new Koa()
  const socket = new IO()
  socket.attach( app )

  t.ok( app.io, 'socket is attached to koa app' )
  t.ok( app.server, 'server created linking socket and the koa callback' )
})

tape( 'should not alter a koa app that already has .io unless called with a namespace', t => {
  t.plan( 1 )

  const app = new Koa()
  const socket = new IO()
  app.io = {}

  t.throws( () => {
    socket.attach( app )
  }, null, 'calling .attach throws an error when .io already exists without a namespace' )
})

tape( 'should not alter a koa app that already has .server', t => {
  t.plan( 1 )

  const app = new Koa()
  const socket = new IO()
  app.server = {}

  t.throws( () => {
    socket.attach( app )
  }, null, 'calling .attach throws an error when .server already exists' )
})

tape( 'Attaching a namespace to a koa app with socket.io existing is all cool', t => {
  t.plan( 2 )

  const app = new Koa()
  const socket = new IO()
  const chat = new IO( 'chat' )

  socket.attach( app )

  t.doesNotThrow( () => {
    chat.attach( app )

    t.ok( app.chat, 'the chat namespace has been attached to the app' )
  }, null, 'Attaching a new namespace works great' )
})

tape( 'Attaching a namespace to a \'clean\' koa app is fine', t => {
  t.plan( 3 )

  const app = new Koa()
  const chat = new IO( 'chat' )

  t.doesNotThrow( () => {
    chat.attach( app )

    t.ok( app.chat, 'the chat namespace has been attached to the app' )
    t.ok( app.io, 'io will be attached, it just isnt listening' )
  }, null, 'Attaching only a namespace is fine' )
})

tape( 'Attaching a namespace should be done via an options object', t => {
  t.plan( 2 )

  const app = new Koa()
  const chat = new IO({
    namespace: 'chat'
  })

  t.doesNotThrow( () => {
    chat.attach( app )
    t.ok( app.chat, 'the chat namespace has been attached to the app' )
  }, null, 'Attaching only a namespace via options hash is fine' )
})

tape( 'Namespaces can be hidden from the app object', t => {
  t.plan( 2 )

  const app = new Koa()
  const chat = new IO({
    namespace: 'chat',
    hidden: true
  })

  chat.attach( app )

  const srv = app.server.listen()
  const client = ioc( 'ws://localhost:' + srv.address().port + '/chat', {
    transports: [ 'websocket' ]
  })

  client.on( 'disconnect', () => {
    srv.close()
  })
  client.on( 'connect', () => {
    client.disconnect()
  })

  chat.on( 'connection', ctx => {
    t.notOk( app.chat, 'chat should exist but not be available on the app' )
    t.ok( true, 'Client can connect to the chat namespace even though it is not available on the app' )
  })
})

tape( 'The default namespace can not be hidden, app.io must be attached to app', t => {
  t.plan( 1 )

  const app = new Koa()
  const io = new IO({
    hidden: true
  })

  t.throws( () => {
    io.attach( app )
  }, null, 'Attaching a hidden default instance will throw' )
})
