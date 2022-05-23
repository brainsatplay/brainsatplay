
import WebSocket from 'ws'
import {WebSocketServer} from 'ws'

export class HotReload {
  config = null;
  wss = null;
  url = null;

  constructor (cfg){
    this.config = cfg
    this.wss = new WebSocketServer({ // new WebSocket.Server({
      port: cfg.hotreload
    });

    this.url = `${cfg.socket_protocol}://${cfg.host}:${cfg.port}/hotreload`;

    this.wss.on('error',(err)=>{
      console.error('hotreload wss error:',err);
    })

    this.wss.on('connection', (ws) => {
      //ws.send(something);
    
      if(cfg.debug) console.log('New Connection to Hot Reload socket!');
    
      ws.on('message', function message(data) {
          console.log('received: %s', data); //log messages from client
      });
    
      ws.send(`${this.url}: pong!`);
    
    });

  }

  add = (content) => {
    if(typeof content !== 'string') content = content.toString();
    return `${content}\n\n<script> console.log('Hot Reload port available at ${this.url}');  (`+HotReloadClient.toString()+`)('${this.url}')  </script>`;
  }
}

export function addHotReloadClient(content,socketUrl) {
  if(typeof content !== 'string') content = content.toString();
  return `${content}\n\n<script> console.log('Hot Reload port available at ${socketUrl}');  (`+HotReloadClient.toString()+`)('${socketUrl}')  </script>`;
}

//frontend js function to be stringified, injected, and executed in-browser
export const HotReloadClient = (socketUrl) => {
    //hot reload code injected from backend
    //const socketUrl = `ws://${cfg.host}:${cfg.hotreload}`;
    let socket = new WebSocket(socketUrl);
    socket.addEventListener('close',()=>{
      // Then the server has been turned off,
      // either due to file-change-triggered reboot,
      // or to truly being turned off.
  
      // Attempt to re-establish a connection until it works,
      // failing after a few seconds (at that point things are likely
      // turned off/permanantly broken instead of rebooting)
      const interAttemptTimeoutMilliseconds = 100;
      const maxDisconnectedTimeMilliseconds = 3000;
      const maxAttempts = Math.round(maxDisconnectedTimeMilliseconds/interAttemptTimeoutMilliseconds);
      let attempts = 0;
      const reloadIfCanConnect = ()=>{
        attempts ++ ;
        if(attempts > maxAttempts){
          console.error("Could not reconnect to dev server.");
          return;
        }
        socket = new WebSocket(socketUrl);
        socket.onerror = (er) => {
          console.error(`Hot reload port disconnected, will reload on reconnected. Attempt ${attempts} of ${maxAttempts}`);
        }
        socket.addEventListener('error',()=>{
          setTimeout(reloadIfCanConnect,interAttemptTimeoutMilliseconds);
        });
        socket.addEventListener('open',()=>{
          location.reload();
        });
      };
      reloadIfCanConnect();
    });
}

// exports.hotreload = hotreload;
// exports.socketUrl = socketUrl;
// exports.addhotload = addhotreload;
// exports.hotreloadclient = hotreloadclient;

