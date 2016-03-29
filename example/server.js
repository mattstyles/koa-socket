
const fs = require( 'fs' )
const path = require( 'path' )

const Koa = require( 'koa' )
const IO = require( '../' )
const co = require( 'co' )

const app = new Koa()
const io = new IO()
const chat = new IO( 'chat' )

io.attach( app )
chat.attach( app )

/**
 * Koa Middlewares
 */
app.use( co.wrap( function *( ctx, next ) {
  const start = new Date
  yield next()
  const ms = new Date - start
  console.log( `${ ctx.method } ${ ctx.url } - ${ ms }ms` )
}))


/**
 * App handlers
 */
app.use( ctx => {
  ctx.type = 'text/html'
  ctx.body = fs.createReadStream( path.join( __dirname, 'index.html' ) )
})

/**
 * Socket middlewares
 */
io.use( co.wrap( function *( ctx, next ) {
  console.log( 'Socket middleware' )
  const start = new Date
  yield next()
  const ms = new Date - start
  console.log( `WS ${ ms }ms` )
}))
io.use( co.wrap( function *( ctx, next ) {
  ctx.teststring = 'test'
  yield next()
}))

/**
 * Socket handlers
 */
io.on( 'connection', ctx => {
  console.log( 'Join event', ctx.socket.id )
  io.broadcast( 'connections', {
    numConnections: io.connections.size
  })
  // app.io.broadcast( 'connections', {
  //   numConnections: socket.connections.size
  // })
})

io.on( 'disconnect', ctx => {
  console.log( 'leave event', ctx.socket.id )
  io.broadcast( 'connections', {
    numConnections: io.connections.size
  })
})
io.on( 'data', ( ctx, data ) => {
  console.log( 'data event', data )
  console.log( 'ctx:', ctx.event, ctx.data, ctx.socket.id )
  console.log( 'ctx.teststring:', ctx.teststring )
  ctx.socket.emit( 'response', {
    message: 'response from server'
  })
})
io.on( 'ack', ( ctx, data ) => {
  console.log( 'data event with acknowledgement', data )
  ctx.acknowledge( 'received' )
})
io.on( 'numConnections', packet => {
  console.log( `Number of connections: ${ io.connections.size }` )
})

/**
 * Chat handlers
 */
chat.on( 'connection', ctx => {
  console.log( 'Joining chat namespace', ctx.socket.id )
})
chat.on( 'message', ctx => {
  console.log( 'chat message received', ctx.data )

  // Broadcasts to everybody, including this connection
  app.chat.broadcast( 'message', 'yo connections, lets chat' )

  // Broadcasts to all other connections
  ctx.socket.broadcast( 'message', 'ok connections:chat:broadcast' )

  // Emits to just this socket
  ctx.socket.emit( 'message', 'ok connections:chat:emit' )
})

const PORT = 3000
app.listen( 3000, () => {
  console.log( `Listening on ${ PORT }` )
} )
