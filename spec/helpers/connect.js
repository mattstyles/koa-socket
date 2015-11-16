
'use strict';

const minimist = require( 'minimist' )
const ioc = require( 'socket.io-client' )

const argv = minimist( process.argv.slice( 2 ) )

const client = ioc( 'ws://0.0.0.0:' + argv.port, {
  transports: [ 'websocket' ]
})

client.on( 'disconnect', () => {
  process.exit( 0 )
})

process.on( 'message', msg => {
  if ( msg.action === 'disconnect' ) {
    client.disconnect()
  }
})
