
/**
 * Socket constuctor.
 * Appends listeners to a socket instance.
 *
 * @constructor
 * @param socket - socket.io socket connection
 */
var Socket = module.exports = function( socket, listeners, middleware ) {
    this.socket = socket;

    this.init();

    // Add each listener to the socket, additionally passing the event through attached middleware
    listeners.forEach( function( listener ) {
        socket.on( listener.event, function( data ) {

            // Pass the socket event through any middleware
            // @TODO: do it koa styley
            middleware.forEach( function( mw ) {
                mw( data, socket );
            });

            // Scope this to the socket instance
            listener.handler.call( socket, data );
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
}
