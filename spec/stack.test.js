
'use strict';

const tape = require( 'tape' )
const co = require( 'co' )
const IO = require( '../' )

const application = require( './helpers/utils' ).application
const connection = require( './helpers/utils' ).connection


tape( 'Listeners can be added during runtime to connected clients', t => {
  t.plan( 2 )

  const io = new IO()
  const app = application( io )

  const client = connection( app.server )

  client.on( 'connect', () => {
    var called = false
    client.on( 'response', ctx => {
      called = true
    })

    client.emit( 'request' )

    // Wait for a response and see if called turns true
    setTimeout( () => {
      t.notOk( called, 'Called should remain false' )

      io.on( 'request', ctx => {
        ctx.socket.emit( 'response' )
      })

      client.emit( 'request' )

      setTimeout( () => {
        t.ok( called, 'IO should now respond to the event and called should be true' )
        client.disconnect()
      }, 500 )
    }, 500 )
  })
})

tape( 'Middleware can be added during runtime to connected clients', t => {
  t.plan( 2 )

  const io = new IO()
  const app = application( io )

  const client = connection( app.server )

  io.on( 'req1', ctx => {
    ctx.socket.emit( 'res1', ctx.foo )
  })
  io.on( 'req2', ctx => {
    ctx.socket.emit( 'res2', ctx.foo )
  })

  client.on( 'connect', () => {
    client.on( 'res1', data => {
      t.notOk( data, 'Middleware did not fire and attach additional prop' )

      io.use( co.wrap( function *( ctx, next ) {
        ctx.foo = 'foo'
      }))

      client.emit( 'req2' )
    })

    client.on( 'res2', data => {
      t.ok( data, 'Middleware has fired and attached prop' )
      client.disconnect()
    })

    client.emit( 'req1' )
  })
})
