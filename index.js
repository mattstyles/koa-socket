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
var _listeners = [];


/**
 * Number of active connections
 */
var _numConnections = 0;


/**
 * List of id's of active connections
 */
var _connections = [];


/**
 * Middleware list
 */
var _middleware = [];


/**
 * Expose object to manage attaching listeners to connections
 */
var koaSocket = module.exports = {};

/**
 * Takes a koa instance (or any object that implements an http handler) and attaches socket.io to it
 *
 * @param koa {Koa || http handler} koa instance or object that implements handler as callback function
 */
koaSocket.start = function( koa ) {
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
 * Add a function to the stack of middleware
 *
 * @param fn {function}
 */
koaSocket.use = function( fn ) {
    _middleware.push( fn );
    return koaSocket;
},

/**
 * Getter for the list of connected sockets
 *
 * @returns {array}
 */
koaSocket.getConnections = function() {
    return _connections;
},


/**
 * Stores a listener, ready to attach.
 *
 * @param event {String} name of event
 * @param handler {Function} the callback to fire on event
 */
koaSocket.on = function( event, handler ) {
    _listeners.push({
        event: event,
        handler: handler
    });
},


/**
 * Binds listeners to the socket connection
 *
 * @param socket - socket.io socket connection
 */
koaSocket.attach = function( socket ) {
    var sock = new Socket( socket, _listeners, _middleware );
    _connections.push({
        id: socket.id,
        socket: socket
    });
    _numConnections++;
    return sock;
}



/**
 * @get numConnections
 */
Object.defineProperty( koaSocket, 'numConnections', {
    get: function() {
        return _numConnections;
    }
});


/**
 * Adds a new connection to the list
 *
 * @param socket {Socket instance}
 * @private
 */
function addConnection( socket ) {
    _connections.push({
        id: socket.id,
        socket: socket
    });
}
