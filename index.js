/**
 * Koa-socket
 * ---
 *
 * © 2014 Matt Styles @personalurban
 */

var Socket = require( './lib/socket' );


/**
 * Listeners ready to attach to a socket instance
 */
var listeners = [];


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
