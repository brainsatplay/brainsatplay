const https = require('https')
const http = require('http')
const DataServer = require('./DataServer.js');
const WebSocket = require('ws')
const mongodb = require('mongodb')
const uuid = require('uuid')

// Create Brainstorm Server Instance
const createBrainstorm = async (app, config={},onListen=()=>{},onError=()=>{}) => {

const url = 'localhost'
let port
let protocol
let credentials

 if (config.port != null) port = config.port 
 else port = '80'
 if (config.protocol != null) protocol = config.protocol 
 else protocol = 'http'
 if (config.credentials != null) credentials = config.credentials 
 else credentials = {}

let mongouri = config.mongouri

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
let wss = new WebSocket.Server({ clientTracking: false, noServer: true }); // Use for Production


// Create Brainstorm Data Server
const dataServer = new DataServer();

// Database Setup
let mongoClient;
if (mongouri) {
   mongodb.MongoClient.connect(mongouri, {useUnifiedTopology: true}).then(mongoClient => {
    dataServer.mongoClient =  mongoClient
    console.log('Connected to MongoDB Database')
   }).catch(err => {
        console.log('Error: ' + err)
    })
}

// Other Server Events
server.on('clientError', (a,b,c) => {
  console.log('clientError', a,b,c)
})

server.on('checkExpectation', (a,b,c) => {
  console.log('checkExpectation', a,b,c)
})

server.on('checkContinue', (a,b,c) => {
  console.log('checkContinue', a,b,c)
})

server.on('request', (a,b,c) => {
  console.log('request', a,b,c)
})


// Authenticate User Before Connecting WebSocket
server.on('upgrade', async (request, socket, head) => {

  console.log('attempting to create new websocket connection')

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
    if (subprotocols.origin == null) subprotocols.origin = ''

    let username = subprotocols['username']
    let password = subprotocols['password']
    let origin = subprotocols['origin']

    // Pass Credentials to Authentication Script
    authenticate({username,password},mongoClient).then((res) => {

      if (res.result !== 'OK') {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      username = res.msg
      wss.handleUpgrade(request, socket, head, function (ws) {
        wss.emit('connection', ws, {username,origin}, request);
      });
    })
});


// Connect Websocket
wss.on('connection', function (ws, msg, req) {

  let username = msg.username;
  let origin = msg.origin;

  // add user
  dataServer.addUser(username, origin, ws);
    ws.send(JSON.stringify({msg:'resetUsername',username:username}));
  });
  

server.listen(parseInt(port), () => {
    console.log(`A Brainstorm is brewing on ${protocol}://${url}:${port}`)
});

server.onListen = onListen
server.onError = onError

return server
}

// Authentication Script
const authenticate = async (auth, mongodb) => {
    let username = auth.username
    const dbName = "brainsatplay";
    let dict = {result:'incomplete',msg:'no message set'};

    try {
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
    } catch {
        if (username === '' || username === 'guest'){
            username = uuid.v4();
        }
        dict = { result: 'OK', msg: username}
    }
return dict
}

exports.createBrainstorm = createBrainstorm
