# tinybuild
Minimal [esbuild](https://esbuild.github.io/getting-started/#your-first-bundle), [Nodejs](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework), and [Python Quart](https://pgjones.gitlab.io/quart/) concurrent build and test env.  


![tinybuild](docs/globalOutput.png)


`npm i -g tinybuild`

then from an empty project folder, initialize a default app with:

`tinybuild`

Type

`tinybuild help` for accepted arguments, see the boilerplate created in the new repo for more. The `tinybuild` command will use your edited `tinybuild.js` config file after initialization so you can use it generically, else see the created `package.json` for more local commands.

tinybuild commands:

global command:
- `tinybuild` -- runs the boilerplate tinybuild bundler + server settings in the current working directory. It will create missing index.js, package.json (with auto npm/yarn install), and tinybuild.js, and serve with watched folders in the working directory (minus node_modules because it slows down) for hot reloading.

local command:
- `node path/to/tinybuild.js` -- will use the current working directory as reference to run this packager config

arguments (applies to both):
- `start` -- runs the equivalent of `node tinybuild.js` in the current working directory.
- `bundle` -- runs the esbuild bundler, can specify config with `config={"bundler":{}}` via a jsonified (and URI-encoded if there are spaces) object
- `serve` -- runs the node development server, can specify config with `config={"server":{}}` via a jsonified object and (URI-encoded if there are spaces) object
- `mode=python` -- runs the development server as well as python which also serves the dist from a separate port (7000 by default). 
- `mode=dev` for the dev server mode (used by default if you just type `tinybuild` on boilerplate)
- `path=custom.js` -- target a custom equivalent tinybuild.js entry file (to run the packager or bundler/server)
- `init` -- initialize a folder as a new tinybuild repository with the necessary files, you can include the source using the below command
- `core=true` -- include the tinybuild source in the new repository with an appropriate package.json
- `entry=index.js` --name the entry point file you want to create, defaults to index.js
- `script=console.log("Hello%20World!")` -- pass a jsonified and URI-encoded (for spaces etc.) javascript string, defaults to a console.log of Hello World!
- `config={"server":{},"bundler":{}}` -- pass a jsonified and URI-encoded (for spaces etc.) config object for the packager. See the bundler and server settings in the docs.
- `host=localhost` - host name for the server, localhost by default
- `port=8080` - port for the server, 8080 by default
- `protocol=http` - http or https? You need ssl cert and key to run https
- `python=7000` - port for python server so the node server can send a kill signal, 7000 by default. Run the python server concurrently or use `mode=python`
- `hotrelaod=5000` - hotreload port for the node server, 5000 by default
- `startpage=index.html` - entry html page for the home '/' page, index.html by default
- `certpath=tinybuild/node_server/ssl/cert.pem` - cert file for https 
- `keypath=tinybuild/node_server/ssl/key.pem` - key file for https
- `pwa=tinybuild/pwa/workbox-config.js` - service worker config for pwa using workbox-cli (installed separately via package.json), the server will install a manifest.json in the main folder if not found, https required


## [Quickstart](tinybuild/docs/tinybuild.md)
## [esbuild app and library bundling](tinybuild/docs/esbuild.md)
## [Node development/production server](tinybuild/docs/server.md)
## [Python development/production server](tinybuild/docs/python.md)

### Other notes:

See README.md files in each subfolder for more explanation on how to work with these types of applications.
