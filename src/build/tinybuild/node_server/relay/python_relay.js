//let cfg = require('../server_settings');
import WebSocket from 'ws';
import {WebSocketServer} from 'ws';

//const WebSocket = require('ws');

//connect to quart's wss

//set in server_settings.js

export class PythonClient {
    config = null;
    ws = null;
    url = null;

    constructor(cfg={},wss) {
        this.config = cfg;
        this.wss = wss;
        if(cfg.python){

            this.url = `wss://${cfg.host}:${cfg.python}`;
            this.ws = new WebSocket(
                this.url,
                {rejectUnauthorized: false}
            );

            this.ws.on('error', (err) => {
                console.error(err.toString());
            });
        
            this.ws.on('connectFailed',(err)=>{
                console.error(err.toString());
            });
        
            this.ws.on('open',(ws)=>{
                let now = new Date(Date.now());
                console.log(now.getHours()+':'+now.getMinutes()+':'+now.getSeconds()+ ': Ping: Node connected to python WSS!');
                py_client.send('nodejs');
            });
        
            //let decoder = new TextDecoder();
        
            this.ws.on('message',(msg)=>{
                //let now = new Date(Date.now());
                //console.log(now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ': Python->Node:',decoder.decode(msg))
                wss.clients.forEach((cl) => {
                    cl.send(msg);
                });
            })
        }
    }
}


// client.connect(python_socketUrl);
//single connection stream

//exports.py_client = py_client;



//**********************//
//**********************//
// WSS Relay From Quart //
//**********************//
//**********************//



export class PythonRelay {
    config = null;
    server = null;
    url = null;

    constructor(cfg={}) {
        this.config = cfg
        if(cfg.python_node){

        this.url = `ws://${this.cfg.host}:${this.cfg.python_node}`;
        this.wss = new WebSocketServer({ // new WebSocket.Server({
            port:this.cfg.python_node
        });


    this.wss.on('error',(err)=>{
        console.error('python wss error:',err);
    })

    this.wss.on('connection', (ws) => {
        //ws.send(something);

        if(this.cfg.debug) console.log('New Connection to Python Socket Relay!');

        ws.on('message', function message(data) {
            console.log('received: %s', data); //log messages from clients
        });

        ws.send(`${py_socketUrl}: pong!`);

        if(py_client.readyState !== py_client.OPEN) { 
            ws.send(`Python relay not connected, is https enabled? Closing inactive connection!`);
            ws.close();
        }
    });
    }
}
}

// exports.py_socketUrl = py_socketUrl;
// exports.py_wss = py_wss;

//**********************//
//**********************//
//  WS Client to Quart  //
//**********************//
//**********************//
