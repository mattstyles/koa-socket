
/**
 * Socket constuctor.
 * Appends listeners to a socket instance.
 *
 * @constructor
 * @param socket - socket.io socket connection
 */
var Socket = module.exports = function( socket, listeners ) {
    this.socket = socket;

    this.init();

    listeners.forEach( function( listener ) {
        socket.on( listener.event, listener.handler );
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


/**
 * Returns the socket.io connected socket instance
 *
 * @returns {Socket.io}
 */
Socket.prototype.get = function() {
    return this.socket;
}
