
'use strict';

const tape = require( 'tape' )
const Koa = require( 'koa' )
const Socket = require( '../' )

tape( 'socket.start alters the app to include socket.io', t => {
  t.plan( 2 )

  const app = new Koa()
  const socket = new Socket()
  socket.attach( app )

  t.ok( app.io, 'socket is attached to koa app' )
  t.ok( app.server, 'server created linking socket and the koa callback' )
})

tape( 'should not alter a koa app that already has .io', t => {
  t.plan( 1 )

  const app = new Koa()
  const socket = new Socket()
  app.io = {}

  t.throws( () => {
    socket.attach( app )
  }, null, 'calling .attach throws an error when .io already exists' )
})

tape( 'should not alter a koa app that already has .server', t => {
  t.plan( 1 )

  const app = new Koa()
  const socket = new Socket()
  app.server = {}

  t.throws( () => {
    socket.attach( app )
  }, null, 'calling .attach throws an error when .server already exists' )
})
