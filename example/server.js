
const fs = require( 'fs' )
const path = require( 'path' )

const Koa = require( 'koa' )
const IO = require( '../' )
const co = require( 'co' )

const app = new Koa()
const socket = new IO()
const chat = new IO( 'chat' )

socket.attach( app )
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
socket.use( co.wrap( function *( ctx, next ) {
  console.log( 'Socket middleware' )
  const start = new Date
  yield next()
  const ms = new Date - start
  console.log( `WS ${ ms }ms` )
}))
socket.use( co.wrap( function *( ctx, next ) {
  ctx.teststring = 'test'
  yield next()
}))

/**
 * Socket handlers
 */
socket.on( 'connection', ctx => {
  console.log( 'Join event', ctx.socket.id )
  socket.broadcast( 'connections', {
    numConnections: socket.connections.size
  })
})

socket.on( 'disconnect', ctx => {
  console.log( 'leave event', ctx.socket.id )
  socket.broadcast( 'connections', {
    numConnections: socket.connections.size
  })
})
socket.on( 'data', ( ctx, data ) => {
  console.log( 'data event', data )
  console.log( 'ctx:', ctx.event, ctx.data, ctx.socket.id )
  console.log( 'ctx.teststring:', ctx.teststring )
  ctx.socket.emit( 'response', {
    message: 'response from server'
  })
})
socket.on( 'numConnections', packet => {
  console.log( `Number of connections: ${ socket.connections.size }` )
})

/**
 * Chat handlers
 */
chat.on( 'connection', ctx => {
  console.log( 'Joining chat namespace', ctx.socket.id )
})
chat.on( 'message', ctx => {
  console.log( 'chat message received', ctx.data )
  chat.broadcast( 'message', 'yo connections, lets chat' )
})

const PORT = 3000
app.server.listen( 3000, () => {
  console.log( `Listening on ${ PORT }` )
} )
