
'use strict';

const tape = require( 'tape' )
const co = require( 'co' )
const IO = require( '../' )

const application = require( './helpers/utils' ).application
const connection = require( './helpers/utils' ).connection


tape( 'An event handler can be associated with an event', t => {
  t.plan( 1 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  io.on( 'req', ctx => {
    t.pass( 'The event handler has been triggered' )
    client.disconnect()
  })

  client.emit( 'req' )
})

tape( 'Multiple events can be set listening', t => {
  t.plan( 1 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  var count = 0

  io.on( 'req', ctx => {
    count++
  })
  io.on( 'req2', ctx => {
    count++
    t.equal( count, 2, 'Both events were triggered' )
    client.disconnect()
  })

  client.emit( 'req' )
  client.emit( 'req2' )
})

tape( 'Multiple handlers can be connected to an event', t => {
  t.plan( 1 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  var count = 0

  io.on( 'req', ctx => {
    // First handler
    count++
  })
  io.on( 'req', ctx => {
    // Second handler
    count++
  })
  io.on( 'end', ctx => {
    t.equal( count, 2, 'Both handlers should have been triggered' )
    client.disconnect()
  })

  client.emit( 'req' )
  client.emit( 'end' )
})

tape( 'A handler can be removed', t => {
  t.plan( 1 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  var count = 0

  function add() {
    count++
  }

  io.on( 'req', add )
  client.emit( 'req' )

  setTimeout( () => {
    io.off( 'req', add )
    client.emit( 'req' )

    setTimeout( () => {
      t.equal( count, 1, 'Add function is called only once' )
      client.disconnect()
    }, 500 )
  }, 500 )
})

tape( 'A handler can be removed from a multiple handler event', t => {
  t.plan( 2 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  var count = 0

  function add() {
    count++
  }
  function plus() {
    count++
  }

  io.on( 'req', add )
  io.on( 'req', plus )
  client.emit( 'req' )

  setTimeout( () => {
    t.equal( count, 2, 'Both handlers should have been called' )
    io.off( 'req', add )
    client.emit( 'req' )

    setTimeout( () => {
      t.equal( count, 3, 'After removal only one handler will have been triggered' )
      client.disconnect()
    }, 500 )
  }, 500 )
})

tape( 'A specific handler can be removed from an event - front', t => {
  t.plan( 2 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  var count1 = 0
  var count2 = 0

  function add() {
    count1++
  }
  function plus() {
    count2++
  }

  io.on( 'req', add )
  io.on( 'req', plus )
  client.emit( 'req' )

  setTimeout( () => {
    t.ok( count1 === 1 && count2 === 1, 'Both handlers should have been called' )
    io.off( 'req', add )
    client.emit( 'req' )

    setTimeout( () => {
      t.ok( count1 === 1 && count2 === 2, 'A specific handler has been removed from the start of the list' )
      client.disconnect()
    }, 500 )
  }, 500 )
})

tape( 'A specific handler can be removed from an event - last', t => {
  t.plan( 2 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  var count1 = 0
  var count2 = 0

  function add() {
    count1++
  }
  function plus() {
    count2++
  }

  io.on( 'req', add )
  io.on( 'req', plus )
  client.emit( 'req' )

  setTimeout( () => {
    t.ok( count1 === 1 && count2 === 1, 'Both handlers should have been called' )
    io.off( 'req', plus )
    client.emit( 'req' )

    setTimeout( () => {
      t.ok( count1 === 2 && count2 === 1, 'A specific handler has been removed from the end of the list' )
      client.disconnect()
    }, 500 )
  }, 500 )
})


tape( 'All handlers can be removed from an event', t => {
  t.plan( 2 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  var count = 0

    function add() {
      count++
    }
    function plus() {
      count++
    }

    io.on( 'req', add )
    io.on( 'req', plus )
    client.emit( 'req' )

    setTimeout( () => {
      t.equal( count, 2, 'Both handlers should have been called' )
      io.off( 'req' )
      client.emit( 'req' )

      setTimeout( () => {
        t.equal( count, 2, 'All handlers have been removed from the event' )
        client.disconnect()
      }, 500 )
    }, 500 )
})

tape( 'All handlers can be removed from a socket instance', t => {
  t.plan( 2 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  var count = 0

    function add() {
      count++
    }
    function plus() {
      count++
    }

    io.on( 'req1', add )
    io.on( 'req2', plus )
    client.emit( 'req1' )
    client.emit( 'req2' )

    setTimeout( () => {
      t.equal( count, 2, 'Both handlers should have been called' )
      io.off()
      client.emit( 'req1' )
      client.emit( 'req2' )

      setTimeout( () => {
        t.equal( count, 2, 'All handlers have been removed from the event' )
        client.disconnect()
      }, 500 )
    }, 500 )
})

tape( 'Middleware is run before listeners', t => {
  t.plan( 1 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  var count = 0

  io.use( co.wrap( function *( ctx, next ) {
    count++
  }))
  io.on( 'req', ctx => {
    t.equal( count, 1, 'Middleware runs before listeners' )
    client.disconnect()
  })

  client.emit( 'req' )
})

tape( 'Middleware can manipulate the context', t => {
  t.plan( 1 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  io.use( co.wrap( function *( ctx, next ) {
    ctx.foo = true
  }))
  io.on( 'req', ctx => {
    t.ok( ctx.foo, 'Context can be manipulated' )
    client.disconnect()
  })

  client.emit( 'req' )
})

tape( 'Middleware can be traversed', t => {
  t.plan( 2 )

  const io = new IO()
  const app = application( io )
  const client = connection( app.server )

  io.use( co.wrap( function *( ctx, next ) {
    ctx.count = 0
    yield next()
    t.equal( ctx.count, 1, 'Downstream middleware manipulated the context' )
    ctx.count++
  }))
  io.use( co.wrap( function *( ctx, next ) {
    ctx.count++
  }))
  io.on( 'req', ctx => {
    t.equal( ctx.count, 2, 'Middleware upstream and downstream have executed' )
    client.disconnect()
  })

  client.emit( 'req' )
})
