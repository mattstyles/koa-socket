
/**
 * Socket constuctor.
 * Appends listeners to a socket instance.
 *
 * @constructor
 * @param socket - socket.io socket connection
 */

var compose = require( 'koa-compose' ),
    co = require( 'co' );


/**
 * Adds the event listener to start of the middleware chain and yields immediately so that it is executed after middleware stack is navigated
 *
 * @param listener {function} the event handler to fire
 * @param middleware {Array} the list of middleware functions
 * @returns {Array} the new list of functions forming the event chain
 */
var composer = function( listener, middleware ) {
    return [ function *( next ) {
        yield next;
        listener.handler.call( this.socket, this.data );
    }].concat( middleware );
};


/**
 * Socket constructor.
 * Called when a socket gets connected and attaches any listeners and middleware to the event chain.
 *
 * @param socket {connected socket instance}
 * @param listeners {Array} list of events and handlers
 * @param middleware {Array} list of middleware to pass event data through
 */
var Socket = module.exports = function( socket, listeners, middleware ) {
    this.socket = socket;

    this.init();

    // Add each listener to the socket, additionally passing the event through attached middleware
    listeners.forEach( function( listener ) {

        socket.on( listener.event, function( data ) {
            var packet = {
                data: data,
                socket: socket
            };

            // Use composer to attach the event listener to run after the middleware stack is complete
            var gen = compose( composer( listener, middleware) );
            var fn = co( gen );
            fn.call( packet );
        });
    });
};


/**
 * Initialises the connected socket instance
 */
Socket.prototype.init = function() {
    Object.defineProperty( this, 'id', {
        get: function() {
            return this.socket.id;
        }
    });
};
