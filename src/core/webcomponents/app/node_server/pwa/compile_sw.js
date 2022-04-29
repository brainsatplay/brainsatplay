const { build } = require("esbuild")

build({
  entryPoints: ["bundler/pwa/service-worker.js"],
  outfile: "dist/service-worker.js",
  minify: true,
  bundle: true,
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.TEST': true
  },
}).catch(() => process.exit(1))