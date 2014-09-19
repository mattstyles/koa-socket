/**
 * Koa-socket
 * ---
 *
 * © 2014 Matt Styles @personalurban
 */

var http = require( 'http' ),
    socketIO = require( 'socket.io' ),

    Socket = require( './lib/socket' );


/**
 * Listeners ready to attach to a socket instance
 */
var listeners = [];


/**
 * Expose object to manage attaching listeners to connections
 */
module.exports = {

    /**
     * Takes a koa instance (or any object that implements an http handler) and attaches socket.io to it
     *
     * @param koa {Koa || http handler} koa instance or object that implements handler as callback function
     */
    use: function( koa ) {
        if ( koa.server || koa.io ) {
            console.error( 'Sockets failed to initialise\nInstance may already exist' );
            return;
        }

        koa.server = http.createServer( koa.callback() );
        koa.io = socketIO( koa.server );

        koa.io.on( 'connection', function onConnected( socket ) {
            console.log( 'Socket connected', socket.id );
            this.attach( socket );
        }.bind( this ));
    },


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
