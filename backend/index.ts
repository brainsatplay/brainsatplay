// import robot from 'robotjs'
import { localIP } from './network.js' // Print the network you're on
import { WebSocketServer } from 'ws';

const port = 8765
// let thrown = false
const wss = new WebSocketServer({ port });

console.log(`Server running at http://${localIP}:${port}/`)

wss.on('connection', function connection(ws) {

  console.log('Client connected!\n')

  ws.on('error', console.error);
  ws.on('message', (message) => {
    const { id, command, payload } = JSON.parse(message as any)
    
    const response: any = { id, command, response: true }
    if (command === 'key') {
      console.log('Key Sent:', payload)
      // if (robot.keyTap) robot.keyTap(payload)
      // else if (!thrown) {
      //   console.error('robotjs not installed correctly', robot)
      //   thrown = true
      // }
    }

    else if (command === 'platform') response.payload = process.platform
    
    else {
      response.error = 'Unknown command'
      delete response.payload
    }

    ws.send(JSON.stringify(response))

  });
});

// wss.close()