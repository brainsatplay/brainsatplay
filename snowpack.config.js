// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
      src: '/_dist_',
      public: {url: "/", static: true, resolve: false}
  },
  plugins: [
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-typescript',
    ["@snowpack/plugin-optimize", {
      minifyJS: true,
      minifyCSS: true,
      minifyHTML: true,
      preloadModules: true,
      preloadCSS: true,
      target: 'es2015'
    }],
  ],
  packageOptions: {
    polyfillNode: true
  },
  devOptions: {
    port:1234
  },
  buildOptions: {
    out: 'build',
    clean: true,
    sourcemap: true,
    htmlFragments: true
},
alias: {
  "src": "./src",
  "styles": './src/styles',
  /* ... */
},
}

//externalPackage: [...require('module').builtinModules.filter(m => m !== 'process')],
  