
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
socket.on( 'connection', socket => {
  console.log( 'Join event', socket.id )
})
socket.on( 'data', ( ctx, packet ) => {
  console.log( 'data event', packet )
  console.log( 'ctx:', ctx.event, ctx.data, ctx.socket.id )
  console.log( 'ctx.teststring:', ctx.teststring )
})

const PORT = 3000
console.log( `Listening on ${ PORT }` )
socket.start( app )
app.server.listen( 3000 )
