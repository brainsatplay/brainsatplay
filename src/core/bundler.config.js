import bundle from '../bundler.config.js'
// import pkg from './package.json';
// const pkg = { main: 'index.js', module: 'index.esm.js' }

// const umd = {
//   input: './index.ts', // our source file
//   output: [{
//     file: pkg.main,
//     format: 'umd', // the preferred format
//     exports: 'named',
//     name: 'brainsatplay'
//   },
//   { file: pkg.module, format: 'esm' }
//   ]
// }


// const es6 = {
//   input: './index.ts', // our source file
//   output: [{ file: pkg.module, format: 'esm' }]
// }

bundle({globalThis: 'brainsatplay'}, true)