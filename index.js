
var listeners = [];




var Socket = function( socket ) {
    listeners.forEach( function( listener ) {
        socket.on( listener.event, listener.handler );
    });
}





module.exports = {

    on: function( event, handler ) {
        listeners.push({
            event: event,
            handler: handler
        });
    },


    attach: function( socket ) {
        return new Socket( socket, listeners );
    }
}
