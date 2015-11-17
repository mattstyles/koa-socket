
const path = require( 'path' )
const minimist = require( 'minimist' )

const argv = minimist( process.argv.slice( 2 ) )
console.log( argv )

argv._.forEach( file => {
  require( path.resolve( file ) )
})
