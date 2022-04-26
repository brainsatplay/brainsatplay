let cfg = require('../server_settings');

const WebSocket = require('ws');



//connect to quart's wss
const WebSocketClient = WebSocket;

//set in server_settings.js
const python_socketUrl = `wss://${cfg.settings.host}:${cfg.settings.python}`;

const py_client = new WebSocketClient(
    python_socketUrl,
    {
        rejectUnauthorized: false
    });

    //console.log(client)

/*  NodeJS streams API
    const duplex = createWebSocketStream(ws, { encoding: 'utf8' });
    duplex.pipe(process.stdout);
    process.stdin.pipe(duplex);
*/
py_client.on('error', (err) => {
    console.error(err.toString());
});

py_client.on('connectFailed',(err)=>{
    console.error(err.toString());
});

py_client.on('open',(ws)=>{
    let now = new Date(Date.now());
    console.log(now.getHours()+':'+now.getMinutes()+':'+now.getSeconds()+ ': Ping: Node connected to python WSS!');
    py_client.send('nodejs');
});

//let decoder = new TextDecoder();

py_client.on('message',(msg)=>{
    //let now = new Date(Date.now());
    //console.log(now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ': Python->Node:',decoder.decode(msg))
    py_wss.clients.forEach((cl) => {
        cl.send(msg);
    });
})


// client.connect(python_socketUrl);
//single connection stream

exports.py_client = py_client;



//**********************//
//**********************//
// WSS Relay From Quart //
//**********************//
//**********************//


//set in server_settings.js, this url is used in the client to connect 
const py_socketUrl = `ws://${cfg.settings.host}:${cfg.settings.python_node}`;

const py_wss = new WebSocket.Server({
    port:cfg.settings.python_node
});

py_wss.on('error',(err)=>{
    console.error('python wss error:',err);
})

py_wss.on('connection', (ws) => {
    //ws.send(something);

    if(cfg.settings.debug) console.log('New Connection to Python Socket Relay!');

    ws.on('message', function message(data) {
        console.log('received: %s', data); //log messages from clients
    });

    ws.send(`${py_socketUrl}: pong!`);

    if(py_client.readyState !== py_client.OPEN) { 
        ws.send(`Python relay not connected, is https enabled? Closing inactive connection!`);
        ws.close();
    }
});

exports.py_socketUrl = py_socketUrl;
exports.py_wss = py_wss;

//**********************//
//**********************//
//  WS Client to Quart  //
//**********************//
//**********************//
