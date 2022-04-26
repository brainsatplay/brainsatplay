const cfg = require('../server_settings.js');
const WebSocket = require('ws');

//set in server_settings.js
const socketUrl = `${cfg.settings.socket_protocol}://${cfg.settings.host}:${cfg.settings.port}/hotreload`;

const hotreload = new WebSocket.Server({
    port: cfg.settings.hotreload
});

hotreload.on('error',(err)=>{
  console.error('python wss error:',err);
})

hotreload.on('connection', (ws) => {
  //ws.send(something);

  if(cfg.settings.debug) console.log('New Connection to Hot Reload socket!');

  ws.on('message', function message(data) {
      console.log('received: %s', data); //log messages from clients
  });

  ws.send(`${socketUrl}: pong!`);

});

const addhotreload = (content) => {
  return `${content.toString()}\n\n<script>(`+hotreloadclient.toString()+`)('${socketUrl}')</script>`;
}

const hotreloadclient = (socketUrl) => {
    //hot reload code injected from backend
    //const socketUrl = `ws://${cfg.settings.host}:${cfg.settings.hotreload}`;
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

exports.hotreload = hotreload;
exports.socketUrl = socketUrl;
exports.addhotload = addhotreload;
exports.hotreloadclient = hotreloadclient;