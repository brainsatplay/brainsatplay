const express = require('express')
const debug = require('debug')('myexpressapp:server')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
require('dotenv').config()
// const brainsatplay = require('brainsatplay')

const brainstorm = require('./src/libraries/js/src/brainstorm/Brainstorm.js')

// Generate Applet Manifest
let appletDict = {}
let appletDir = path.join(__dirname,'src','applets')
let categories = fs.readdirSync(appletDir)
categories = categories.filter(c => (!c.match(/Templates/) && (fs.existsSync(path.join(appletDir,c)) && fs.lstatSync(path.join(appletDir,c)).isDirectory())))

categories.forEach((category,indOut) => {
  let categoryDir = path.join(appletDir,category)
  let files = fs.readdirSync(categoryDir)
  files = files.filter(f => (fs.existsSync(path.join(categoryDir,f)) && fs.lstatSync(path.join(categoryDir,f)).isDirectory()))

  var bar = new Promise((resolve, reject) => {
    files.forEach((file,indIn) => {
      let dir = path.join(appletDir,category,file)
      let settingsFile = path.join(dir,'settings.js')
      if(fs.existsSync(settingsFile)){
        let data = fs.readFileSync(settingsFile)
        let decoded = data.toString('utf-8')
          let afterName = decoded.split('"name": ')[1]
          if (afterName == null) afterName = decoded.split('name: ')[1]
          let nameStr = afterName.split('\n')[0]
          let name = nameStr.slice(1,nameStr.lastIndexOf(nameStr[0]))
          appletDict[name] = {}
          appletDict[name].folderUrl = '../../../' + dir.split(path.join(__dirname,'/src/'))[1]

          let afterDevices = decoded.split('"devices": [')[1]
          if (afterDevices == null) afterDevices = decoded.split('devices: [')[1]
          let devicesString1 = afterDevices.split('\n')[0]
          let deviceSubstring = devicesString1.substring(0,devicesString1.lastIndexOf(']'))
          let deviceArray = Array.from(deviceSubstring.replace(/'|"|`/g,'').split(','))
          appletDict[name].devices = deviceArray 

          let afterCategories = decoded.split('"categories": [')[1]
          if (afterCategories == null) afterCategories = decoded.split('categories: [')[1]
          let categoryString1 = afterCategories.split('\n')[0]
          let categorySubstring = categoryString1.substring(0,categoryString1.lastIndexOf(']'))
          let categoryArray = Array.from(categorySubstring.replace(/'|"|`/g,'').split(','))
          appletDict[name].categories = categoryArray 
      }
      if (indIn === files.length-1) resolve()
      });
  })
  bar.then(() => {
    if (indOut === categories.length-1){
    for(const prop in appletDict){
      appletDict[prop]['folderUrl'] = appletDict[prop]['folderUrl'].replace(/\\/g,'/');
    }
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

// Settings
const protocol = 'https';
const url = 'localhost'
var port = normalizePort(process.env.PORT || '443'); // Secure

//
// App
//
const app = express();

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

//Listen to Port for HTTP Requests
app.use(function(req, res, next) {
  const validOrigins = [
    `http://localhost`,
    `https://localhost`,
    'https://brainsatplay.azurewebsites.net',
    'http://brainsatplay.azurewebsites.net',
    'https://brainsatplay.com',
    'http://server.brainsatplay.com',
    'https://server.brainsatplay.com',
    'https://app.brainsatplay.com',
  ];

  console.log('checking origin')

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

  let snowServer;
  const {startServer,loadConfiguration} = require('snowpack');
  (async () => {
    const config = await loadConfiguration({},'snowpack.config.js')
    // const config = await loadConfiguration({},'snowpack.config.cjs')
    snowServer = await startServer({config});
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
