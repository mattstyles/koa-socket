
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
   * @param namespace <String> namespace identifier
   */
  constructor( opts ) {
    if ( opts && !(typeof opts !== 'string' || opts && typeof opts !== 'object' ) ) {
      throw new Error( 'Incorrect argument passed to koaSocket constructor' )
    }

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

    /**
     * Configuration options
     * @type <Object>
     */
    if ( typeof opts === 'string' ) {
      opts = {
        namespace: opts
      }
    }
    this.opts = Object.assign({
      /**
       * Namespace id
       * @type <String>
       * @default null
       */
       namespace: null,

       /**
        * Hidden instances do not append to the koa app, but still require attachment
        * @type <Boolean>
        * @default false
        */
       hidden: false,

       /**
        * Options to pass when instantiating socket.io
        * @type <Object>
        * @default {}
        */
       ioOptions: {}
    }, opts )

    /**
     * Holds the socketIO connection
     * @type <Socket.IO>
     */
    this.socket = null

    // Bind handlers
    this.onConnection = this.onConnection.bind( this )
    this.onDisconnect = this.onDisconnect.bind( this )
  }

  /**
   * Attach to a koa application
   * @param app <Koa app> the koa app to use
   */
  attach( app ) {

    if ( app.server && app.server.constructor.name != 'Server' ) {
      throw new Error( 'app.server already exists but it\'s not an http server' );
    }

    if ( !app.server ) {
      // Create a server if it doesn't already exists
      app.server = http.createServer( app.callback() )

      // Patch `app.listen()` to call `app.server.listen()`
      app.listen = function listen(){
        app.server.listen.apply( app.server, arguments )
        return app.server
      }
    }

    if ( app._io ) {
      // Without a namespace we’ll use the default, but .io already exists meaning
      // the default is taken already
      if ( !this.opts.namespace ) {
        throw new Error( 'Socket failed to initialise::Instance may already exist' )
      }

      this.attachNamespace( app, this.opts.namespace )
      return
    }

    if ( this.opts.hidden && !this.opts.namespace ) {
      throw new Error( 'Default namespace can not be hidden' )
    }

    app._io = new socketIO( app.server, this.opts.ioOptions )

    if ( this.opts.namespace ) {
      this.attachNamespace( app, this.opts.namespace )
      return
    }

    // Attach default namespace
    app.io = this

    // If there is no namespace then connect using the default
    this.socket = app._io
    this.socket.on( 'connection', this.onConnection )
  }

  /**
   * Attaches the namespace to the server
   * @param app <Koa app> the koa app to use
   * @param id <String> namespace identifier
   */
  attachNamespace( app, id ) {
    if ( !app._io ) {
      throw new Error( 'Namespaces can only be attached once a socketIO instance has been attached' )
    }

    this.socket = app._io.of( id )
    this.socket.on( 'connection', this.onConnection )

    if ( this.opts.hidden ) {
      return
    }

    if ( app[ id ] ) {
      throw new Error( 'Namespace ' + id + ' already attached to koa instance' )
    }

    app[ id ] = this
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
