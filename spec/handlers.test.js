
'use strict';

const tape = require( 'tape' )
const co = require( 'co' )
const IO = require( '../' )

const application = require( './helpers/utils' ).application
const connection = require( './helpers/utils' ).connection


tape( 'An event handler can be associated with an event', t => {
  t.plan( 1 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  io.on( 'req', ctx => {
    t.pass( 'The event handler has been triggered' )
    client.disconnect()
  })

  client.emit( 'req' )
})

tape( 'Multiple events can be set listening', t => {
  t.plan( 1 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  var count = 0

  io.on( 'req', ctx => {
    count++
  })
  io.on( 'req2', ctx => {
    count++
    t.equal( count, 2, 'Both events were triggered' )
    client.disconnect()
  })

  client.emit( 'req' )
  client.emit( 'req2' )
})

tape( 'Multiple handlers can be connected to an event', t => {
  t.plan( 1 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  var count = 0

  io.on( 'req', ctx => {
    // First handler
    count++
  })
  io.on( 'req', ctx => {
    // Second handler
    count++
  })
  io.on( 'end', ctx => {
    t.equal( count, 2, 'Both handlers should have been triggered' )
    client.disconnect()
  })

  client.emit( 'req' )
  client.emit( 'end' )
})
