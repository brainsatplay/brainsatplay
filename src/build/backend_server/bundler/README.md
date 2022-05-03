ESBuild instructions: [Link](https://esbuild.github.io/getting-started/#your-first-bundle)

Also see rollup options.

The bundler implementation just builds src/app.js into dist/app.js. 

ESBuild enables coding in the latest ECMAScript syntax, .jsx compilation, .ts compilation, etc. with efficient build times into
servable app files.



For React builds:

`npm i react react-dom`

Create app.jsx in src/ and add:
```js
  import * as React from 'react'
  import * as Server from 'react-dom/server'

  let Greet = () => <h1>Hello, world!</h1>
  console.log(Server.renderToString(<Greet />))
```
 
  Then in bundler.js:
```js
  require('esbuild').build({
    entryPoints: ['src/app.jsx'],
    bundle: true,
    outfile: 'dist/app.js',
  }).catch(() => process.exit(1))
```

 */


## For TypeScript builds:

`npm i typescript --save-dev`

Create a tsconfig.json with ts build settings. These overrule anything in esbuild fyi

e.g.
```json
    {
    "compilerOptions": {
        "module": "commonjs", //'ESNEXT', 'ES2020', 'ES2018', 'ES5', 'ES6', etc.
        "noImplicitAny": true,
        "removeComments": true,
        "preserveConstEnums": true,
        "sourceMap": true
    },
    "include": ["src/**/*"], 
    "exclude": ["node_modules"]
    }
```

Create an app.ts file in src/

In bundler.js:
```js

const { dependencies, peerDependencies } = require('./package.json');

require('esbuild').build({
  entryPoints: ['src/app.ts'],
  outdir: 'dist', //or outfile:dist/app.js
  bundle: true,
  external: Object.keys(dependencies).concat(Object.keys(peerDependencies)),
});
```


 */