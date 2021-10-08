const express = require('express')
const debug = require('debug')('myexpressapp:server')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

require('dotenv').config()
let secure
if (process.env.SECURE == null) secure = true
else secure = process.env.SECURE === 'true'
// require('dotenv').config({ path: `.env2` })
// const brainsatplay = require('brainsatplay')

const brainstorm = require('./src/libraries/js/src/brainstorm/Brainstorm.js')
const createAppletManifest = require('./src/platform/createAppletManifest')
const createPluginManifest = require('./src/platform/createPluginManifest')


createAppletManifest()
createPluginManifest()

const cert = fs.readFileSync('./snowpack.crt');
const key = fs.readFileSync('./snowpack.key');
var credentials = {key, cert};

// Settings
let protocol = (secure) ? 'https' : 'http'

const url = 'localhost'
var port = normalizePort(process.env.PORT || '443'); // Secure

//
// App
//
const app = express();

// app.use(async (req, res, next) => {
//   try {
//     console.log('trying to build')
//     const buildResult = await snowServer.loadUrl(req.url);
//     res.send(buildResult.contents);
//   } catch (err) {
//     next(err);
//   }
// });

// Other Middleware
app.use(cors()) // allow Cross-domain requests
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Listen to Port for HTTP Requests
app.use(function(req, res, next) {
  const validOrigins = [
    `https://10.0.0.22`,
    `http://localhost`,
    `https://localhost`,
    'https://brainsatplay.azurewebsites.net',
    'http://brainsatplay.azurewebsites.net',
    'https://brainsatplay.com',
    'http://server.brainsatplay.com',
    'https://server.brainsatplay.com',
    'https://app.brainsatplay.com',
  ];

  const origin = req.headers.origin;

  if (validOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Set Routes
let initRoutes = require("./src/platform/server/routes/web.js")
initRoutes(app);

// development error handler
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log('error', err)
  });
}

// production error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log('error', err)
});

// Setting the port
app.set('port', port);

/*
 * Event listener for HTTP server "error" event.
 */

const onError = (error) => {

  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/*
 * Event listener for HTTP server "listening" event.
 */

function onListening(){}

//
// Server
//
let brainstormConfig = {port:port, protocol:protocol, credentials:credentials, mongouri: process.env.MONGO_URI}
brainstorm.createBrainstorm(app, brainstormConfig, onListening, onError).then(server => {
  server.onListen = onListening
  server.onError = onError

  //
  // Snowpack
  //
  const {startServer,loadConfiguration} = require('snowpack');
  (async () => {
    const config = await loadConfiguration({},'snowpack.config.js')
    // const config = await loadConfiguration({},'snowpack.config.cjs')
    let snowServer = await startServer({config});
  })()

})



/*
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
