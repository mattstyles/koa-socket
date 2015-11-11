
/**
 * Koa-socket
 * ---
 *
 * © 2015 Matt Styles @personalurban
 */

var compose = require( 'koa-compose' )
var co = require( 'co' )

/**
 * Socket constructor.
 * Called when a socket gets connected and attaches any listeners and middleware to the event chain.
 * @param socket {connected socket instance}
 * @param listeners {Array} list of events and handlers
 * @param middleware {Array} list of middleware to pass event data through
 */
var Socket = module.exports = function( socket, listeners, middleware ) {
  this.socket = socket

  this.init()

  // Add each listener to the socket, additionally passing the event through attached middleware
  listeners.forEach( function( listener ) {

    socket.on( listener.event, function( data ) {
      var packet = {
        event: listener.event,
        data: data,
        socket: socket
      }

      // Compose middlewares and then fire into the event listener
      // @TODO wrap generators in co.wrap
      compose( middleware )( packet )
        .then( function handler() {
          listener.handler( packet, data )
        })
    })
  })
}


/**
 * Initialises the connected socket instance
 */
Socket.prototype.init = function() {
  Object.defineProperty( this, 'id', {
    get: function() {
      return this.socket.id
    }
  })
}
