const express = require('express');
const debug = require('debug')('myexpressapp:server');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require("cors")
const WebSocket = require('ws');
// const mongodb = require('mongodb'
require('dotenv').config();

// New Server Code
const dataServer = require('./src/js/dataServer.js'); 
const auth = require('./src/js/auth.js'); 
let dataServ = new dataServer('test');

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
// mongodb.MongoClient.connect(process.env.MONGO_URI, { useUnifiedTopology: true })
//   .then(client => {
//     app.set('mongodb', client);
//     console.log('Connected to Database')
//   })

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
const initRoutes = require("./src/js/routes/web.js");
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
const http = require('http'); 
let server = http.createServer(app);  

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

    let username = getCookie(request, 'username') || request.headers['sec-websocket-protocol'].split('username')[1].split(',')[0]
    let password = getCookie(request, 'password') || request.headers['sec-websocket-protocol'].split('password')[1].split(',')[0]
    let appname = getCookie(request, 'appname') | request.headers['sec-websocket-protocol'].split('appname')[1].split(',')[0]

    let res = await auth.check({username,password},app.get('mongodb'))
    if (res.result !== 'OK') {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    username = res.msg
    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, {username,appname}, request);
    });
});

wss.on('connection', function (ws, msg, request) {

  let username = msg.username
  let appname = msg.appname

  // specify websocket behavior
  ws.on('message', function (s) {
    let o = JSON.parse(s);
    dataServ.processUserCommand(username,o.msg)
  });

  ws.on('close', function () {
    dataServ.removeUser(username)
  });
  
  // add user
  dataServ.addUser(username,appname,ws)
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