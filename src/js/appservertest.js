/*
const Bundler = require('parcel-bundler')
import express from 'express';
import debugLib from 'debug';
const debug = debugLib('myexpressapp:server')
import path from 'path';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from "cors"
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
import WebSocket from 'ws';
import dotenv from 'dotenv';
import mongodb from 'mongodb'
dotenv.config();

// New Server Code
import dataServerClass from './dataServer.js'; 
import auth from './auth.js'; 


let dataServer = new dataServerClass('test');

// Settings
let protocol = 'http';
const url = 'localhost'
var port = normalizePort(process.env.PORT || '1234');

//
// App
//
const file = 'src/index.html'; // Pass an absolute path to the entrypoint here
const options = {}; // See options section of api docs, for the possibilities

const bundler = new Bundler(file, options);
const app = express();
app.use(bundler.middleware())
app.use(cors()) // allow Cross-domain requests
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Setup
mongodb.MongoClient.connect(process.env.MONGO_URI, { useUnifiedTopology: true })
  .then(client => {
    app.set('mongodb', client);
    console.log('Connected to Database')
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
import initRoutes from "./routes/web.js";
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

// Static Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Setting the port
app.set('port', port);

//
// Server
//
import http from 'http'; 
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

    dataServer.addUser(username,appname,ws)

    // Manage specific messages from clients
    ws.on('message', function (s) {
      let o = JSON.parse(s);
      dataServer.processUserCommand(username,o.msg)
    });

    ws.on('close', function () {
      console.log('closing')
    });
});

// error handlers

server.listen(parseInt(port), () => {
  console.log('listening on *:' + port);
});

server.on('error', onError);
server.on('listening', onListening);

console.log(`Server is running on ${protocol}://${url}:${port}`)


/**
 * Normalize a port into a number, string, or false.
 */
/*
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

/**
 * Event listener for HTTP server "error" event.
 */
/*
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

/**
 * Event listener for HTTP server "listening" event.
 */
/*
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}




*/

import{brainsatplay} from './appv2'
import {DOMFragment} from './frontend/DOMFragment'

let connectHTML = `
	<button id='connect'>connectDevice</button>
	<button id='server'>connectServer</button>
`;

let bcisession = new brainsatplay('guest','');

let ui = new DOMFragment(connectHTML,document.body,undefined,
	() => {
		document.getElementById('connect').onclick = () => {
			if(bcisession.info.authenticated) bcisession.connect('FreeEEG32_2',true,['EEG_Ch','FP1','all'],true,true);
			else bcisession.connect('FreeEEG32_2',false,['EEG_Ch','FP1','all'],true,true);
		}
		document.getElementById('server').onclick = () => {
			bcisession.login();
		}
	},
	undefined,
	'NEVER');
