
const fs = require( 'fs' )
const path = require( 'path' )

const Koa = require( 'koa' )
const IO = require( '../' )
const co = require( 'co' )

const app = new Koa()
const io = new IO()

io.attach( app )

/**
 * Koa Middlewares
 */
app.use( async ( ctx, next ) => {
  const start = new Date
  await next()
  const ms = new Date - start
  console.log( `${ ctx.method } ${ ctx.url } - ${ ms }ms` )
})


/**
 * App handlers
 */
app.use( ctx => {
  ctx.type = 'text/html'
  ctx.body = fs.createReadStream( path.join( __dirname, 'index.html' ) )
})

/**
 * io middlewares
 */
io.use( async ( ctx, next ) => {
  console.log( 'io middleware' )
  const start = new Date
  await next()
  const ms = new Date - start
  console.log( `WS ${ ms }ms` )
})
io.use( async ( ctx, next ) => {
  ctx.teststring = 'test'
  await next()
})

/**
 * io handlers
 */
io.on( 'connection', ctx => {
  console.log( 'Join event', ctx.socket.id )
  io.broadcast( 'connections', {
    numConnections: io.connections.size
  })
})

io.on( 'disconnect', ctx => {
  console.log( 'leave event', ctx.io.id )
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
io.on( 'numConnections', packet => {
  console.log( `Number of connections: ${ io.connections.size }` )
})


const PORT = 3000
app.listen( 3000, () => {
  console.log( `Listening on ${ PORT }` )
} )
