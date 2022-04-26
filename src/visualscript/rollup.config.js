// Install Rollup Plugins
// yarn add rollup rollup-plugin-polyfill @babel/core @babel/preset-env @rollup/plugin-commonjs @web/rollup-plugin-copy @rollup/plugin-node-resolve rollup-plugin-minify-html-literals rollup-plugin-summary rollup-plugin-typescript2 rollup-plugin-terser rollup-plugin-import-css @rollup/plugin-node-resolve @rollup/plugin-babel @babel/plugin-proposal-class-properties -D

import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import css from "rollup-plugin-import-css";
import {terser} from "rollup-plugin-terser";
import node_resolve from "@rollup/plugin-node-resolve";
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
// import regenerator from 'rollup-plugin-regenerator';

/**
 * @type {import('rollup').RollupOptions}
 */

const umd = {
  input: './src/index.ts', // our source file
  output: [   {
    file: pkg.main,
    format: 'umd', // the preferred format
    exports: 'named',
    name: 'visualscript'
  } ]
}


const es6 = {
  input: './src/index.ts', // our source file
  output: [ { file: pkg.module, format: 'es'  } ]
}


const common = {
 plugins: [
    commonjs(),
    node_resolve(),
    babel({
        babelHelpers: 'runtime',
        plugins: [
          "@babel/plugin-proposal-class-properties",
          ["@babel/plugin-transform-runtime", {
            "regenerator": true
         }]
      ]
    }),
    css(),
    // Resolve bare module specifiers to relative paths
    resolve(),
    // Minify JS
    // terser(),
    // regenerator(),
    // Support Typescript
  typescript({ 
   typescript: require('typescript'),
  }),
 ],
//  preserveEntrySignatures: 'strict',
}

export default [
  Object.assign({}, umd, common),
  Object.assign({}, es6, common)
]