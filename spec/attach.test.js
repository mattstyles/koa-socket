
'use strict';

const tape = require( 'tape' )
const Koa = require( 'koa' )
const IO = require( '../' )

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
  t.plan( 1 )

  const app = new Koa()
  const socket = new IO()
  const chat = new IO( 'chat' )

  socket.attach( app )

  t.doesNotThrow( () => {
    chat.attach( app )
  }, null, 'Attaching a new namespace works great' )
})

tape( 'Attaching a namespace to a \'clean\' koa app is fine', t => {
  t.plan( 1 )

  const app = new Koa()
  const chat = new IO( 'chat' )

  t.doesNotThrow( () => {
    chat.attach( app )
  }, null, 'Attaching only a namespace is fine' )
})
