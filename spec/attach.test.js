
'use strict';

const http = require( 'http' )

const tape = require( 'tape' )
const Koa = require( 'koa' )
const ioc = require( 'socket.io-client' )
const socketIO = require( 'socket.io' )
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

tape( 'should not alter a koa app that already has ._io unless called with a namespace', t => {
  t.plan( 1 )

  const app = new Koa()
  const socket = new IO()
  app._io = {}

  t.throws( () => {
    socket.attach( app )
  }, null, 'calling .attach throws an error when ._io already exists without a namespace' )
})

tape( 'should work with koa app that already has .server', t => {
  t.plan( 1 )

  const app = new Koa()
  const socket = new IO()
  app.server = http.createServer()
  socket.attach( app )

  t.ok( app.io, 'socket is attached to koa app' )
})

tape( 'shouldn\'t work if app.server exists but it\'s not an http server', t => {
  t.plan( 1 )

  const app = new Koa()
  const socket = new IO()
  app.server = {}

  t.throws( () => {
    socket.attach( app )
  }, null, 'calling .attach throws an error when .server already exists but it\'s not an http server' )
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
    t.ok( app._io, 'io will be attached, it just isnt listening' )
  }, null, 'Attaching only a namespace is fine' )
})

tape( 'Manually creating the socketIO instance and attaching namespaces without a default is fine', t => {
  t.plan( 1 )

  const app = new Koa()
  const chat = new IO( 'chat' )

  const server = http.createServer( app.callback() )
  const io = socketIO( server )
  app._io = io

  t.doesNotThrow( () => {
    chat.attach( app )
  }, null, 'Attaching a namespace is fine' )

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

tape( 'Attaching a namespace will attach the IO class', t => {
  t.plan( 2 )

  const app = new Koa()
  const chat = new IO( 'chat' )

  chat.attach( app )
  t.ok( app.chat, 'the chat namespace has been attached to the app' )
  t.ok( app.chat instanceof IO, 'an IO instance has been attached' )
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

tape( 'Calling app.listen calls app.server.listen', t => {
  t.plan( 2 )

  const app = new Koa()
  const io = new IO()

  io.attach( app )

  app.server.listen = function() {
    t.pass( 'Calling app.listen called app.server.listen' )
  }

  t.doesNotThrow( () => {
    var srv = app.listen( () => {
      srv.close()
    })
  }, 'Calling app.listen does not throw' )
})
