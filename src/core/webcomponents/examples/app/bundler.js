//Most basic JS esbuild settings
require('esbuild').build({
    entryPoints: ['./app.js'],
    bundle: true,
    outfile: 'dist/app.js',
    target: "es2020",
    loader: {
			'.html': 'text'
		},
		minify: true,
		sourcemap: true,
  }).catch(() => process.exit(1))


//ESBuild instructions:
//https://esbuild.github.io/getting-started/#your-first-bundle
//Natively builds react, ts, etc. with added specification.


/*
//to get automatic type compiling working correctly, apply dtsPlugin to the .iife format build

console.time('es');
console.log('esbuild starting!')

const entryPoints = ['index.ts'];
const outfile = 'dist/index';

const esbuild = require('esbuild');
const {dtsPlugin} = require('esbuild-plugin-d.ts');
//import esbuild from 'esbuild'
//import { dtsPlugin } from 'esbuild-plugin-d.ts'

esbuild.build({ //commonjs
  entryPoints,
  bundle:true,
  outfile:outfile+'.js',
//  platform:'node',
  format:'cjs'
}).then(()=>{
  esbuild.build({ //esmodules
    entryPoints,
    bundle:true,
    outfile:outfile+'.esm.js',
    format:'esm',
  //  platform:'node',
    minify:true
  }).then(()=>{
    esbuild.build({ //generates types correctly
      entryPoints,
      bundle:true,
      outfile:outfile+'.iife.js',
      format:'iife',
    //  platform:'node',
      minify:true,
      plugins:[ 
        dtsPlugin() 
      ]
    }).then(() => {
      console.log('esbuild completed!')
      console.timeEnd('es');
    });
  });
  
});

*/