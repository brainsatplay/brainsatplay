//Most basic JS esbuild settings
//import esbuild from 'esbuild'

require('esbuild').build({
    entryPoints: ['server.ts'],
    bundle: true,
    outfile: 'server.esbuild.js',
    platform:'node'             //builds with node dependencies, not for browser
}).catch(() => process.exit(1))


//ESBuild instructions:
//https://esbuild.github.io/getting-started/#your-first-bundle
//Natively builds react, ts, etc. with added specification.
