
import tape from 'tape'
import Koa from 'koa'
import socket from '../lib'

tape( 'socket.start alters the app to include socket.io', t => {
  t.plan( 2 )

  const app = new Koa()
  socket.start( app )

  t.ok( app.io, 'socket is attached to koa app' )
  t.ok( app.server, 'server created linking socket and the koa callback' )
})

tape( 'should not alter a koa app that already has .io', t => {
  t.plan( 1 )

  const app = new Koa()
  app.io = {}

  t.throws( () => {
    socket.start( app )
  }, null, 'calling .start throws an error' )
})

tape( 'should not alter a koa app that already has .server', t => {
  t.plan( 1 )

  const app = new Koa()
  app.server = {}

  t.throws( () => {
    socket.start( app )
  }, null, 'calling .start throws an error' )
})
