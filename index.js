
"use strict";

const http = require( 'http' )
const socketIO = require( 'socket.io' )
const Socket = require( './lib/socket' )


module.exports = class IO {
  constructor() {
    this.middleware = []
    this.listeners = new Map()
    this.connections = new Map()

    // Bind handlers
    this.onConnection = this.onConnection.bind( this )
    this.onDisconnect = this.onDisconnect.bind( this )
  }

  attach( app ) {
    if ( app.server || app.io ) {
      throw new error( 'Sockets failed to initialise::Instance may already exist' )
    }

    app.server = http.createServer( app.callback() )
    app.io = socketIO( app.server )

    app.io.on( 'connection', this.onConnection )
  }

  use( fn ) {
    this.middleware.push( fn )
    return this
  }

  /**
   * @TODO multiple handlers should be able to be set on the event key
   * this will require work in the Socket class to handle multiple handlers
   */
  on( event, handler ) {
    this.listeners.set( event, handler )
    return this
  }

  onConnection( sock ) {
    this.connections.set( sock.id, new Socket( sock, this.listeners, this.middleware ) )
    sock.on( 'disconnect', this.onDisconnect )
    return sock
  }

  onDisconnect( sock ) {
    this.connections.delete( sock.id )
  }
}
//
// /**
//  * Listeners ready to attach to a socket instance
//  */
// var _listeners = []
//
//
// /**
//  * List of id's of active connections
//  */
// var _connections = []
//
//
// /**
//  * Middleware list
//  */
// var _middleware = []
//
//
// /**
//  * Expose object to manage attaching listeners to connections
//  */
// var koaSocket = module.exports = {}
// // var koaSocket = {}
// // export default koaSocket
//
// /**
//  * Connection callback.
//  * Expects to pass the socket to the callback.
//  */
// koaSocket.onConnect = null
//
// /**
//  * Discount callback.
//  * Expects to pass the socket to the callback.
//  */
// koaSocket.onDisconnect = null
//
//
// /**
//  * Takes a koa instance (or any object that implements an http handler) and attaches socket.io to it
//  * @param koa {Koa || http handler} koa instance or object that implements handler as callback function
//  */
// koaSocket.start = function( koa ) {
//   if ( koa.server || koa.io ) {
//     throw new error( 'Sockets failed to initialise::Instance may already exist' )
//   }
//
//   koa.server = http.createServer( koa.callback() )
//   koa.io = socketIO( koa.server )
//
//   koa.io.on( 'connection', onConnect )
// }
//
//
// /**
//  * Add a function to the stack of middleware
//  * @param fn {function}
//  */
// koaSocket.use = function( fn ) {
//   _middleware.push( fn )
//   return koaSocket
// }
//
//
// /**
//  * Getter for the list of connected sockets
//  * @returns {array}
//  */
// koaSocket.getConnections = function() {
//   return _connections
// }
//
//
// /**
//  * Stores a listener, ready to attach.
//  * @param event {String} name of event
//  * @param handler {Function} the callback to fire on event
//  */
// koaSocket.on = function( event, handler ) {
//   if ( event === 'connection' ) {
//     koaSocket.onConnect = handler
//     return
//   }
//
//   if ( event === 'disconnect' ) {
//     koaSocket.onDisconnect = handler
//     return
//   }
//
//   _listeners.push({
//     event: event,
//     handler: handler
//   })
// }
//
//
// /**
//  * Binds listeners to the socket connection
//  * @param socket - socket.io socket connection
//  */
// koaSocket.attach = function( socket ) {
//   var sock = new Socket( socket, _listeners, _middleware )
//   addConnection( socket )
//   return sock
// }
//
//
//
// /**
//  * @get numConnections
//  */
// Object.defineProperty( koaSocket, 'numConnections', {
//   get: function() {
//     return _connections.length
//   }
// })
//
// /**
//  * Broadcast a message to every connected client
//  * @param event {String} name of event
//  * @param data {} the data to send with the event
//  */
// koaSocket.broadcast = function( event, data ) {
//   _connections
//     .map( connection => connection.socket )
//     .forEach( socket => socket.emit( event, data ) )
// }
//
//
// /**
//  * Adds a new connection to the list
//  * @param socket {Socket instance}
//  * @private
//  */
// function addConnection( socket ) {
//   _connections.push({
//     id: socket.id,
//     socket: socket
//   })
// }
//
//
// /**
//  * Removes a connection from the list
//  * @param id <String>
//  * @private
//  */
// function removeConnection( id ) {
//   var i = _connections.length - 1
//   while( i > 0 ) {
//     if ( _connections[ i ].id === id ) {
//       break
//     }
//     i--
//   }
//
//   _connections.splice( i, 1 )
// }
//
//
// /**
//  * Fired when a socket connects to the server.
//  * Attaches the socket to koaSocket and sets up a disconnect event.
//  * @param socket {socket connection}
//  * @private
//  */
// function onConnect( socket ) {
//   //console.log( 'Socket connected', socket.id )
//   koaSocket.attach( socket )
//   socket.on( 'disconnect', onDisconnect )
//   if ( koaSocket.onConnect ) {
//     koaSocket.onConnect( socket )
//   }
// }
//
// /**
//  * Fired when a socket disconnects from the server
//  * @private
//  */
// function onDisconnect() {
//   //console.log( 'Socket disconnected', this.id )
//   removeConnection( this.id )
//   if ( koaSocket.onDisconnect ) {
//     koaSocket.onDisconnect( this )
//   }
// }
