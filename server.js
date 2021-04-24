const express = require('express');
const debug = require('debug')('myexpressapp:server');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require("cors")
const WebSocket = require('ws');
const mongodb = require('mongodb');
const fs = require('fs')
const cert = fs.readFileSync('./snowpack.crt');
const key = fs.readFileSync('./snowpack.key');
var credentials = {key, cert};
require('dotenv').config();
// const brainsatplay = require('./src/library/dist/brainsatplay')

// New Server Code
const DataServer = require('./src/library/src/server/DataServer.js'); 
const auth = require('./src/library/src/server/auth.js'); 
let dataServ = new DataServer();

// Settings
let protocol = 'http';
const url = 'localhost'
var port = normalizePort(process.env.PORT || '8000');

//
// App
//
const app = express();

// Snowpack
let snowServer;
const {startServer,loadConfiguration} = require('snowpack');
(async () => {
  const config = await loadConfiguration({},'snowpack.config.js')
  snowServer = await startServer({config});
})()

app.use(async (req, res, next) => {
  try {
    const buildResult = await snowServer.loadUrl(req.url);
    res.send(buildResult.contents);
  } catch (err) {
    next(err);
  }
});

// Other Middleware
app.use(cors()) // allow Cross-domain requests
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// // Database Setup
mongodb.MongoClient.connect(process.env.MONGO_URI, { useUnifiedTopology: true }).then(db => {
  app.set('mongoClient', db);
  dataServ.mongodb = app.get('mongoClient')
  console.log('Connected to Database')
  // let b = new brainsatplay.Session()
}).catch(err => {
  console.log('Error: ' + err)
})

//Listen to Port for HTTP Requests
app.use(function(req, res, next) {
  const validOrigins = [
    `http://localhost`,
    'http://localhost:1234',
    'https://brainsatplay.azurewebsites.net',
    'http://brainsatplay.azurewebsites.net',
    'https://brainsatplay.com'
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
const initRoutes = require("./src/library/src/server/routes/web.js");
initRoutes(app);

// development error handler
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log('error')
  });
}

// production error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log('error')
});

// Setting the port
app.set('port', port);

//
// Server
//
// const http = require('http'); 
const https = require('https')
// let server = http.createServer(app);  
let server = https.createServer(credentials, app)

// Websocket
let wss;
wss = new WebSocket.Server({ clientTracking: false, noServer: true });

function getCookie(req,name) {
  const value = `; ${req.headers.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

//Authentication
server.on('upgrade', async (request, socket, head) => {

    let _subprotocols = request.headers['sec-websocket-protocol'].split(', ') || undefined
    let subprotocols = {}
    _subprotocols.forEach((str)=>{
      let arr = str.split('&')
      subprotocols[arr[0]] = arr[1]
    })
    let username = getCookie(request, 'username') || subprotocols['username']
    let password = getCookie(request, 'password') || subprotocols['password']
    let appname = getCookie(request, 'appname') || subprotocols['appname']

    auth.check({username,password},app.get('mongoClient')).then((res) => {

      if (res.result !== 'OK') {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      username = res.msg
      wss.handleUpgrade(request, socket, head, function (ws) {
        wss.emit('connection', ws, {username,appname}, request);
      });
    })
});

wss.on('connection', function (ws, msg, req) {

  let username = msg.username;
  let appname = msg.appname;

  // add user
  dataServ.addUser(username,appname,ws);
  ws.send(JSON.stringify({cmd:'resetUsername',username:username}));
});

// error handlers

server.listen(parseInt(port), () => {
  console.log('listening on *:' + port);
});

server.on('error', onError);
server.on('listening', onListening);

console.log(`Server is running on ${protocol}://${url}:${port}`)


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

/*
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
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

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}