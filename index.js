
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
    let instance = new Socket( sock, this.listeners, this.middleware )
    this.connections.set( sock.id, instance )
    sock.on( 'disconnect', () => {
      this.onDisconnect( sock )
    })

    // Trigger the connection event if attached to the socket listener map
    if ( this.listeners.has( 'connection' ) ) {
      this.listeners.get( 'connection' )({
        event: 'connection',
        data: instance.id,
        socket: instance.socket
      }, instance.id )
    }

    return sock
  }

  onDisconnect( sock ) {
    this.connections.delete( sock.id )
  }
}
