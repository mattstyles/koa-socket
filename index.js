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
 * Connection callback.
 * Expects to pass the socket to the callback.
 */
koaSocket.onConnect = null;

/**
 * Discount callback.
 * Expects to pass the socket to the callback.
 */
koaSocket.onDisconnect = null;


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

    koa.io.on( 'connection', onConnect );
};


/**
 * Add a function to the stack of middleware
 *
 * @param fn {function}
 */
koaSocket.use = function( fn ) {
    _middleware.push( fn );
    return koaSocket;
};


/**
 * Getter for the list of connected sockets
 *
 * @returns {array}
 */
koaSocket.getConnections = function() {
    return _connections;
};


/**
 * Stores a listener, ready to attach.
 *
 * @param event {String} name of event
 * @param handler {Function} the callback to fire on event
 */
koaSocket.on = function( event, handler ) {
    if ( event === 'connection' ) {
        koaSocket.onConnect = handler;
        return;
    }

    if ( event === 'disconnect' ) {
        koaSocket.onDisconnect = handler;
        return;
    }

    _listeners.push({
        event: event,
        handler: handler
    });
};


/**
 * Binds listeners to the socket connection
 *
 * @param socket - socket.io socket connection
 */
koaSocket.attach = function( socket ) {
    var sock = new Socket( socket, _listeners, _middleware );
    addConnection( socket );
    return sock;
};



/**
 * @get numConnections
 */
Object.defineProperty( koaSocket, 'numConnections', {
    get: function() {
        return _connections.length;
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


/**
 * Removes a connection from the list
 */
function removeConnection( id ) {
    var i = _connections.length - 1;
    while( i > 0 ) {
        if ( _connections[ i ].id === id ) {
            break;
        }
        i--;
    }

    _connections.splice( i, 1 );
}


/**
 * Fired when a socket connects to the server.
 * Attaches the socket to koaSocket and sets up a disconnect event.
 *
 * @param socket {socket connection}
 */
function onConnect( socket ) {
    console.log( 'Socket connected', socket.id );
    socket.on( 'disconnect', onDisconnect );
    if ( koaSocket.onConnect ) {
        koaSocket.onConnect( socket );
    }
    koaSocket.attach( socket );
}

/**
 * Fired when a socket disconnects from the server,
 */
function onDisconnect() {
    console.log( 'Socket disconnected', this.id );
    if ( koaSocket.onDisconnect ) {
        koaSocket.onDisconnect( this );
    }
    removeConnection( this.id );
}
