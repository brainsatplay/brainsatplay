---
sidebar_position: 4
title: Routers
---

# Getting Started with Routers

`brainsatplay-frontend` and `brainsatplay-backend` provide default communication services including HTTPService and WebsocketService.

## Loading Frontend Services
In your frontend code, load specify the remote endpoints your Router will listen to:

```js
const SERVER_URI = (window.location.href.includes('localhost')) ? 'http://localhost:80' : 'http://localhost:80' // Replace with production server URI
const SERVER_URI_2 = (window.location.href.includes('localhost')) ? 'http://localhost:81' : 'http://localhost:81' // Replace with production server URI

const endpoints = []
endpoints.push(router.addEndpoint(SERVER_URI))
endpoints.push(router.addEndpoint(SERVER_URI_2))
```

Then load any services you'll want the Router to use:

```js

import {WebsocketService} from 'brainsatplay-frontend' // TODO: Publish and change name

let services = [ 
    new HTTPService(), 
    new WebsocketService(), 
]

services.forEach(service => router.load(service).then(() => console.log('Service connected!', service)))
```

At this point, your project should be able to send HTTP and WebSocket messages to supported servers.


> **Note:** Services can be strongly or weakly linked to FE / BE. Weakly linked Services can run on either FE or BE. For this case, specify backend methods with an underscore (e.g. _backendMethod) so that all frontend methods are easily referenced by an end-user.

## Adding the Backend

In your backend code, create an Express application and link this to your Router with an HTTP Service. Here we will instantiate the Router class ourselves to enable auto-debugging:

```js

// Express Imports
let express = require("express")
let bodyParser = require("body-parser")

// Router Imports
import { Router } from 'brainsatplay'
import {HTTPService, WebsocketService} from 'brainsatplay-backend'

// Create Express App
const app = express();
app.use(bodyParser.json());

// Create HTTP Server
let protocol = "http";
const port = '80';
const server = http.createServer(app);

// Create a Router
let router = new Router({ debug: true });

// Handle All HTTP Routes
let http = new HTTPService();
app.get("**", http.controller);
app.post("**", http.controller);
app.delete("**", http.controller);
router.load(http);

// Handle WebSocket Messages
let websocket = new WebsocketService(server);
router.load(websocket)

// Start the Server
server.listen(parseInt(port), () => {
  console.log(`Server created on ${protocol}://localhost:${port}`);
});
```