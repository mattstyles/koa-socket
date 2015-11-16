
"use strict";

const compose = require( 'koa-compose' )

/**
 * @class
 */
module.exports = class Socket {
  /**
   * Socket constructor.
   * Called when a socket gets connected and attaches any listeners and middleware to the event chain.
   * @param socket {connected socket instance}
   * @param listeners {Array} list of events and handlers
   * @param middleware {Array} list of middleware to pass event data through
   */
  constructor( socket, listeners, middleware ) {
    this.socket = socket

    var _this = this

    // Add each listener to the socket, additionally passing the event through
    // attached middleware
    listeners.forEach( function( handler, event ) {
      // No need to attach a connection handler, its already fired
      if ( event === 'connection' ) {
        return
      }

      // Set up the middleware chain just the once and run it on the event
      // @TODO this is done for each connection but should be passed from the
      // koaSocket instance, that way it can be re-composed if middleware or
      // listeners change during the life cycle of the server
      var chain = compose( middleware )

      // Attach the listener
      socket.on( event, function socketListener( data ) {
        var packet = {
          event: event,
          data: data,
          socket: _this
        }

        // Run middlewares and then fire into the event listener
        chain( packet )
          .then( function callHandler() {
            handler( packet, data )
          })
      })
    })
  }

  /**
   * Getter for the socket id
   * @type <String>
   */
  get id() {
    return this.socket.id
  }

  /**
   * Helper through to the socket
   * @param event <String>
   * @param data <?>
   */
  emit( event, packet ) {
    this.socket.emit( event, packet )
  }

  /**
   * Disconnect helper
   */
  disconnect() {
    this.socket.disconnect()
  }
}
