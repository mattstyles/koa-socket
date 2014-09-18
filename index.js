
/**
 * Listeners ready to attach to a socket instance
 */
var listeners = [];


/**
 * Socket constuctor.
 * Appends listeners to a socket instance.
 *
 * @param socket - socket.io socket connection
 */
var Socket = function( socket ) {
    listeners.forEach( function( listener ) {
        socket.on( listener.event, listener.handler );
    });
};


/**
 * Expose object to manage attaching listeners to connections
 */
module.exports = {

    /**
     * Stores a listener, ready to attach.
     *
     * @param event {String} name of event
     * @param handler {Function} the callback to fire on event
     */
    on: function( event, handler ) {
        listeners.push({
            event: event,
            handler: handler
        });
    },

    /**
     * Binds listeners to the socket connection
     *
     * @param socket - socket.io socket connection
     */
    attach: function( socket ) {
        return new Socket( socket, listeners );
    }
};
