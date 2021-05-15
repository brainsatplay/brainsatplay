const https = require('https')
const http = require('http')
const DataServer = require('./DataServer.js');
const WebSocket = require('ws')
const mongodb = require('mongodb')
const uuid = require('uuid')


// Create Brainstorm Server Instance
const createBrainstorm = async (app, config={}) => {

const url = 'localhost'
let port = config.port ?? '80'
let protocol = config.protocol ?? 'http'
let credentials = config.credentials ?? {}
let mongouri = config.mongouri

function getCookie(req,name) {
  const value = `; ${req.headers.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Create Server
let server
if (protocol === 'https'){
    if (Object.keys(credentials).length > 0){
        server = https.createServer(credentials, app)
    } else  {
        console.log('invalid credentials. Reverting to HTTP protocol.')
        protocol = 'http'
        server = http.createServer(app)
    }
} else {
    protocol = 'http'
    server = http.createServer(app)
}

// Create Websocket Server
let wss = new WebSocket.Server({ clientTracking: false, noServer: true });

// Create Brainstorm Data Server

// Database Setup
let mongoClient ;
if (mongouri) {
   mongoClient = await mongodb.MongoClient.connect(mongouri, {useUnifiedTopology: true}).catch(err => {
        console.log('Error: ' + err)
    })
}

if (mongoClient){
    console.log('Connected to MongoDB Database')
}

const dataServer = new DataServer(mongoClient);

// Authenticate User Before Connecting WebSocket
server.on('upgrade', async (request, socket, head) => {

    // Get User Credentials from Subprotocol / Cookies
    let _subprotocols = request.headers['sec-websocket-protocol'] || undefined
    if (_subprotocols){
      _subprotocols = _subprotocols.split(', ')
    } else {
      _subprotocols = []
    }

    let subprotocols = {}
    _subprotocols.forEach((str)=>{
      let arr = str.split('&')
      subprotocols[arr[0]] = arr[1]
    })

    if (subprotocols.username == null) subprotocols.username = 'guest'
    if (subprotocols.password == null) subprotocols.password = ''
    if (subprotocols.appname == null) subprotocols.appname = ''

    let decodeSubprotocol = (info) => {
      return info.replace('%20',' ')
    }

    let username = decodeSubprotocol( subprotocols['username'])
    let password = decodeSubprotocol(subprotocols['password'])
    let appname = decodeSubprotocol(subprotocols['appname'])
    
    // Pass Credentials to Authentication Script
    authenticate({username,password},mongoClient).then((res) => {

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


// Connect Websocket
wss.on('connection', function (ws, msg, req) {

  let username = msg.username;
  let appname = msg.appname;

  // add user
  dataServer.addUser(username,appname,ws);
  ws.send(JSON.stringify({msg:'resetUsername',username:username}));
});

server.listen(parseInt(port), () => {
    console.log(`A Brainstorm is brewing on ${protocol}://${url}:${port}`)
});
return server
}

// Authentication Script
const authenticate = async (auth, mongodb) => {
    let username = auth.username
    const dbName = "brainsatplay";
    let dict = {result:'incomplete',msg:'no message set'};

    if (mongodb != undefined){
      const db = mongodb.db(dbName);
      if (username === undefined) {
        dict = { result: 'incomplete', msg: 'username not defined' }
    } else {
            if (username !== '' && username != 'guest'){
            let numDocs = await db.collection('profiles').find({ username: username }).count();
            if (numDocs == 0){
                dict = { result: 'OK', msg: username }
            } else {
                dict = { result: 'incomplete', msg: 'profile exists with this username. please choose a different ID.' }
            }
            } else {
            username = uuid.v4();
            dict = { result: 'OK', msg: username}
            }
        } 
    } else {
        if (username === '' || username === 'guest'){
            username = uuid.v4();
        }
        dict = { result: 'OK', msg: username}
    }
return dict
}

exports.createBrainstorm = createBrainstorm
