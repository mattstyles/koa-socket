
'use strict';

const Koa = require( 'koa' )
const ioc = require( 'socket.io-client' )
const IO = require( '../../' )

exports.connection = function( srv, opts ) {
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

exports.application = function( instance ) {
  const app = new Koa()
  const io = instance || new IO()
  io.attach( app )
  return app
}
