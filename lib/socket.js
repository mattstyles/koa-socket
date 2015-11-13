
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

    // Add each listener to the socket, additionally passing the event through
    // attached middleware
    listeners.forEach( function( listener ) {

      // Set up the middleware chain just the once and run it on the event
      var chain = compose( middleware )

      socket.on( listener.event, function( data ) {
        var packet = {
          event: listener.event,
          data: data,
          socket: socket
        }

        // Compose middlewares and then fire into the event listener
        chain( packet )
          .then( function handler() {
            listener.handler( packet, data )
          })
      })
    })
  }

  /**
   * Getter for the socket id
   */
  get id() {
    return this.socket.id
  }
}
