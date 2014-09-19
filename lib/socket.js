
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

            var packet = {
                data: data,
                socket: socket
            };

            // Pass the socket event through any middleware
            // @TODO: add koa style generators
            middleware.forEach( function( mw ) {
                mw.call( packet );
            });

            // Scope this to the socket instance
            listener.handler.call( socket, packet.data );
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
