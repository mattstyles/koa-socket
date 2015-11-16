
"use strict";

const http = require( 'http' )
const socketIO = require( 'socket.io' )
const Socket = require( './lib/socket' )


/**
 * Main IO class that handles the socket.io connections
 * @class
 */
module.exports = class IO {
  /**
   * @constructs
   */
  constructor() {
    /**
     * List of middlewares, these are composed into an execution chain and
     * evaluated with each event
     * @type <Array:Function>
     */
    this.middleware = []

    /**
     * All of the listeners currently added to the IO instance
     * event:callback
     * @type <Map>
     */
    this.listeners = new Map()

    /**
     * All active connections
     * id:Socket
     * @type <Map>
     */
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

    app.listen = function listen() {
      console.warn( 'IO is attached, did you mean app.server.listen()' )
      app.listen( arguments )
    }

    app.io.on( 'connection', this.onConnection )
  }

  /**
   * Pushes a middleware on to the stack
   * @param fn <Function> the middleware function to execute
   */
  use( fn ) {
    this.middleware.push( fn )
    return this
  }

  /**
   * Adds a new listeners to the stack
   * @param event <String> the event id
   * @param handler <Function> the callback to execute
   * @TODO multiple handlers should be able to be set on the event key
   * this will require work in the Socket class to handle multiple handlers
   */
  on( event, handler ) {
    this.listeners.set( event, handler )
    return this
  }

  /**
   * Broadcasts an event to all connections
   * @param event <String>
   * @param data <?>
   */
  broadcast( event, data ) {
    this.connections.forEach( ( socket, id ) => {
      socket.emit( event, data )
    })
  }

  /**
   * Triggered for each new connection
   * Creates a new Socket instance and adds that to the stack and sets up the
   * disconnect event
   * @param sock <Socket.io Socket>
   */
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
  }

  /**
   * Fired when the socket disconnects, simply reflects stack in the connections
   * stack
   * @param sock <Socket.io Socket>
   */
  onDisconnect( sock ) {
    this.connections.delete( sock.id )
  }
}
