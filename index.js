
"use strict";

const http = require( 'http' )
const socketIO = require( 'socket.io' )
const Socket = require( './lib/socket' )


module.exports = class IO {
  constructor() {
    this.middleware = []
    this.listeners = new Map()
    this.connections = new Map()

    // Bind handlers
    this.onConnection = this.onConnection.bind( this )
    this.onDisconnect = this.onDisconnect.bind( this )
  }

  attach( app ) {
    if ( app.server || app.io ) {
      throw new error( 'Sockets failed to initialise::Instance may already exist' )
    }

    app.server = http.createServer( app.callback() )
    app.io = socketIO( app.server )

    app.io.on( 'connection', this.onConnection )
  }

  use( fn ) {
    this.middleware.push( fn )
    return this
  }

  /**
   * @TODO multiple handlers should be able to be set on the event key
   * this will require work in the Socket class to handle multiple handlers
   */
  on( event, handler ) {
    this.listeners.set( event, handler )
    return this
  }

  broadcast( event, packet ) {
    this.connections.forEach( ( socket, id ) => {
      socket.emit( event, packet )
    })
  }

  onConnection( sock ) {
    this.connections.set( sock.id, new Socket( sock, this.listeners, this.middleware ) )
    sock.on( 'disconnect', () => {
      this.onDisconnect( sock )
    })
    return sock
  }

  onDisconnect( sock ) {
    this.connections.delete( sock.id )
  }
}
