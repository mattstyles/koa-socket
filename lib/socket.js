
"use strict";

/**
 * @class
 */
module.exports = class Socket {
  /**
   * Socket constructor.
   * Called when a socket gets connected and attaches any listeners and middleware to the event chain.
   * @param socket <Socket.io Socket>}
   * @param listeners <Map> list of events and handlers
   * @param middleware <Function> composed middleware function
   */
  constructor( socket, listeners, middleware ) {
    this.socket = socket

    // The composed middleware function
    this.middleware = null

    // Append listeners and composed middleware function
    this.update( listeners, middleware )
  }

  /**
   * Adds a specific event and callback to this socket
   * @param event <String>
   * @param data <?>
   */
  on( event, handler ) {
    this.socket.on( event, ( data, cb ) => {
      let packet = {
        event: event,
        data: data,
        socket: this, 
        acknowledge: cb
      }

      if ( !this.middleware ) {
        handler( packet, data )
        return
      }

      this.middleware( packet )
        .then( () => {
          handler( packet, data )
        })
    })
  }

  /**
   * Registers the new list of listeners and middleware composition
   * @param listeners <Map> map of events and callbacks
   * @param middleware <Function> the composed middleware
   */
  update( listeners, middleware ) {
    this.socket.removeAllListeners()
    this.middleware = middleware

    listeners.forEach( ( handlers, event ) => {
      if ( event === 'connection' ) {
        return
      }

      handlers.forEach( handler => {
        this.on( event, handler )
      })
    })
  }

  /**
   * Getter for the socket id
   * @type <String>
   */
  get id() {
    return this.socket.id
  }

  /**
   * Helper through to the socket
   * @param event <String>
   * @param packet <?>
   */
  emit( event, packet ) {
    this.socket.emit( event, packet )
  }

  /**
   * Helper through to broadcasting
   * @param event <String>
   * @param packet <?>
   */
  broadcast( event, packet ) {
    this.socket.broadcast.emit( event, packet )
  }

  /**
   * Disconnect helper
   */
  disconnect() {
    this.socket.disconnect()
  }
}
