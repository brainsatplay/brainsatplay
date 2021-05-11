// import express from 'express';
// import bodyParser from 'body-parser';
// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import WebSocket from 'ws';
// import mongodb from 'mongodb';
// import fs from 'fs';
// import path from 'path';
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = dirname(fileURLToPath(import.meta.url));

// import dotenv from 'dotenv';
// dotenv.config()

// import debug from 'debug';
// debug('myexpressapp:server')

const express = require('express')
const debug = require('debug')('myexpressapp:server')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const WebSocket = require('ws')
const mongodb = require('mongodb')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Generate Applet Manifest
let appletDict = {}
let appletDir = path.join(__dirname,'src','applets')
let categories = fs.readdirSync(appletDir)
categories = categories.filter(c => !c.match(/.js/))

categories.forEach((category,indOut) => {
  let categoryDir = path.join(appletDir,category)
  let files = fs.readdirSync(categoryDir)
  var bar = new Promise((resolve, reject) => {
    files.forEach((file,indIn) => {
      let dir = path.join(appletDir,category,file)
      let data = fs.readFileSync(path.join(dir,'settings.js'))
      let decoded = data.toString('utf-8')
      let nameStr = decoded.split('"name": ')[1].split('\n')[0]
      let name = nameStr.slice(1,nameStr.lastIndexOf(nameStr[0]))
      appletDict[name] = {}
      appletDict[name].folderUrl = '../../../' + dir.split(path.join(__dirname,'/src/'))[1]
      let devicesString1 = decoded.split('"devices": [')[1].split('\n')[0]
      let deviceSubstring = devicesString1.substring(0,devicesString1.lastIndexOf(']'))
      let deviceArray = Array.from(deviceSubstring.replace(/'|"|`/g,'').split(','))
      appletDict[name].devices = deviceArray 
      let categoryString1 = decoded.split('"categories": [')[1].split('\n')[0]
      let categorySubstring = categoryString1.substring(0,categoryString1.lastIndexOf(']'))
      let categoryArray = Array.from(categorySubstring.replace(/'|"|`/g,'').split(','))
      appletDict[name].categories = categoryArray 
      if (indIn === files.length-1) resolve()
      });
  })
  bar.then(() => {
    if (indOut === categories.length-1){
    fs.writeFile('./src/platform/appletManifest.js', 'export const appletManifest = ' + JSON.stringify(appletDict), err => {
      if (err) {
        console.error(err)
        return
      }
      console.log('applet manifest created')
    })
  }
  })
})

const cert = fs.readFileSync('./snowpack.crt');
const key = fs.readFileSync('./snowpack.key');
var credentials = {key, cert};
// const brainsatplay = require('./src/library/dist/brainsatplay')

// New Server Code
const DataServer = require('./src/library/src/DataServer.js');
let auth = require('./src/platform/server/middleware/auth.js')

// import {DataServer} from './src/library/src/DataServer.js'
// import * as auth from './src/platform/server/middleware/auth.mjs'
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
// import {startServer,loadConfiguration} from 'snowpack';
const {startServer,loadConfiguration} = require('snowpack');
(async () => {
  const config = await loadConfiguration({},'snowpack.config.js')
  // const config = await loadConfiguration({},'snowpack.config.cjs')
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
  // app.set('mongoClient', db);
  // dataServ.mongodb = app.get('mongoClient')
  // console.log('Connected to Database')
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
// import {routes} from "./src/platform/server/routes/web.mjs";
let initRoutes = require("./src/platform/server/routes/web.js")
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
// let server = http.createServer(app);  

let https = require('https')
// import https from 'https'
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

    let decodeSubprotocol = (info) => {
      return info.replace('%20',' ')
    }


    let username = decodeSubprotocol(getCookie(request, 'username') || subprotocols['username'])
    let password = decodeSubprotocol(getCookie(request, 'password') || subprotocols['password'])
    let appname = decodeSubprotocol(getCookie(request, 'appname') || subprotocols['appname'])
    
    console.log(username)

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
