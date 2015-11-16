
"use strict";

const http = require( 'http' )
const socketIO = require( 'socket.io' )
const compose = require( 'koa-compose' )

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
     * Composed middleware stack
     * @type <Function>
     */
    this.composed = null

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

    // Add warning to conventional .listen
    // @TODO should this just be removed?
    app.__listen = app.listen
    app.listen = function listen() {
      console.warn( 'IO is attached, did you mean app.server.listen()' )
      app.__listen.apply( app, arguments )
    }

    app.server = http.createServer( app.callback() )
    app.io = socketIO( app.server )

    app.io.on( 'connection', this.onConnection )
  }

  /**
   * Pushes a middleware on to the stack
   * @param fn <Function> the middleware function to execute
   */
  use( fn ) {
    this.middleware.push( fn )
    this.composed = compose( this.middleware )

    this.updateConnections()

    return this
  }

  /**
   * Adds a new listeners to the stack
   * @param event <String> the event id
   * @param handler <Function> the callback to execute
   * @return this
   */
  on( event, handler ) {
    let listeners = this.listeners.get( event )

    // If this is a new event then just set it
    if ( !listeners ) {
      this.listeners.set( event, [ handler ] )
      this.updateConnections()
      return this
    }

    listeners.push( handler )
    this.listeners.set( event, listeners )
    this.updateConnections()
    return this
  }

  /**
   * Removes a listener from the event
   * @param event <String> if omitted will remove all listeners
   * @param handler <Function> if omitted will remove all from the event
   * @return this
   */
  off( event, handler ) {
    if ( !event ) {
      this.listeners = new Map()
      this.updateConnections()
      return this
    }

    if ( !handler ) {
      this.listeners.delete( event )
      this.updateConnections()
      return this
    }

    let listeners = this.listeners.get( event )
    let i = listeners.length - 1
    while( i ) {
      if ( listeners[ i ] === handler ) {
        break
      }
      i--
    }
    listeners.splice( i, 1 )

    this.updateConnections()
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
   * @private
   */
  onConnection( sock ) {
    // let instance = new Socket( sock, this.listeners, this.middleware )
    let instance = new Socket( sock, this.listeners, this.composed )
    this.connections.set( sock.id, instance )
    sock.on( 'disconnect', () => {
      this.onDisconnect( sock )
    })

    // Trigger the connection event if attached to the socket listener map
    let handlers = this.listeners.get( 'connection' )
    if ( handlers ) {
      handlers.forEach( handler => {
        handler({
          event: 'connection',
          data: instance,
          socket: instance.socket
        }, instance.id )
      })
    }
  }

  /**
   * Fired when the socket disconnects, simply reflects stack in the connections
   * stack
   * @param sock <Socket.io Socket>
   * @private
   */
  onDisconnect( sock ) {
    this.connections.delete( sock.id )
  }

  /**
   * Updates all existing connections with current listeners and middleware
   * @private
   */
  updateConnections() {
    this.connections.forEach( connection => {
      connection.update( this.listeners, this.composed )
    })
  }
}
