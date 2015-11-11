
const fs = require( 'fs' )
const path = require( 'path' )

const Koa = require( 'koa' )
const socket = require( '../' )
const co = require( 'co' )

const app = new Koa()


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
socket.on( 'connection', sock => {
  console.log( 'Join event', sock.id )
  socket.broadcast( 'connections', {
    numConnections: socket.numConnections
  })
})
socket.on( 'disconnect', sock => {
  console.log( 'leave event', sock.id )
  socket.broadcast( 'connections', {
    numConnections: socket.numConnections
  })
})
socket.on( 'data', ( ctx, packet ) => {
  console.log( 'data event', packet )
  console.log( 'ctx:', ctx.event, ctx.data, ctx.socket.id )
  console.log( 'ctx.teststring:', ctx.teststring )
  ctx.socket.emit( 'response', {
    message: 'response from server'
  })
})
socket.on( 'numConnections', packet => {
  console.log( `Number of connections: ${ socket.numConnections }` )
})

const PORT = 3000
console.log( `Listening on ${ PORT }` )
socket.start( app )
app.server.listen( 3000 )
