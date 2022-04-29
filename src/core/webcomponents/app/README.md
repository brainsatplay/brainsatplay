# MyAlyce: React + TS minimal [esbuild](https://esbuild.github.io/getting-started/#your-first-bundle), [Nodejs](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework), and [Python Quart](https://pgjones.gitlab.io/quart/) concurrent test env.  

## Build & Run Development Server without Python Server

`npm i` then `npm run startdev`

Find node_server/server_settings.js for easy config for http/https (set socket protocol 'ws' to 'wss' for hosted https). https requires ssl (instructions included in node_server/ssl)

## With Python Server

Requires: Python 3.7 or later and NodeJS LTS or later. 

In server_settings.js, set settings.python to undefined to not use it, or port 7000 is default.

This test runs a websocket and a thread on the [python](https://www.python.org/downloads/) quart server. You can access the Node-served test page at `http://localhost:8080` or the quart server test page at `http://localhost:7000` to experiment (add `/build` at port 7000 to access the node build through python (minus hot reload)). 

Quart enables fast asyncio server streams from python. Bonus thread-generated data in python streaming through websockets to show off the potential.

`npm run pip` should install any missing python packages. See [README](https://github.com/moothyknight/esbuild_base_python/blob/master/python/README.md))

`npm run concurrent` runs both python and node servers concurrently (with hot reloading for FE with a persistent python streaming server backend).

After installing dependencies, 

## Run Python and Node together: 

`npm run concurrent`

Comment out any py_wss or py_client references in node_server/server.js if you want to exclude it altogether else the node server tries to connect to the python port 7000 (only works on https).

## Otherwise

To run: `npm run build` to bundle, then `npm start` to run the node server.

* OR `npm test` to run both commands in sequence

You can specify https and add an ssl certificate if you follow the instructions.

>2 dependencies: `esbuild` and [`fragelement`](https://github.com/brainsatplay/domelement)

## Hot reloading (for dev)

`npm run startdev` 

nodemon restarts the node server automatically when changes to included source files are detected.

The nodemon dev server adds basic frontend hot reloading via websocket and clientside code injection (see [nodeserver/server.js](https://github.com/moothyknight/esbuild_base/blob/master/node_server/server.js) for method).

> 2 dev dependencies: `nodemon` and `ws`

## PWA build:

To test:

`npm run pwa` 

This installs workbox-cli, generates the service worker, bundles and then starts the application. Run once if you don't need to modify the service-worker further.

> 1 additional dependency: `workbox-cli`

### Other notes:

See README.md files in each folder for more explanation on how to work with these types of applications.
