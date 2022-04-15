# brainsatplay
`brainsatplay` enables on-browser **interactive reactive programming** for high-performance scientific computing applications that span multiple programming environments. 

We believe that physiological signals represent the next frontier of interactive programming—beyond traditional events such as mouse movements and button presses.

### Features
🧩 **Composable:** Assemble native and custom components to satisfy your specific requirements.

⚡ **Fast:** Handle streaming data in real-time.

## Monorepo Contents
This monorepo contains several NPM libraries for high-performance computing and inter-process communication.

### Core
- **brainsatplay:** A set of generic message handlers written in Universal JavaScript.
- **brainsatplay-frontend:** Client-side HTTP and Websocket services.
- **brainsatplay-backend:** Server-side HTTP and Websocket services.

### Microservices
- **brainsatplay-database:** Store data + router extension for data management (implemented in [MyAlyce](https://github.com/MyAlyce/myalyce)).
- **brainsatplay-webrtc:** Pass messages to peers over WebRTC.

## Supporting Repositories
- [**brainsatplay-cli**](https://github.com/brainsatplay/brainsatplay-cli) makes it easy to configure a new project using the terminal.
- [**datastreams-api**](https://github.com/brainsatplay/datastreams-api) supports real-time data acquisition through the browser.
- [**visualscript**](https://github.com/brainsatplay/visualscript) allows for visual programming with the `brainsatplay` library.

## Concepts
### Processes
A **Process** is a `Function` that can be stringified and offloaded (e.g. to a Web Worker, to a Node.js server, etc.). 

```javascript
const add = new brainsatplay.Process((self, input, increment) => input + increment)
add.set('increment', 1) // or add.set(0, 1)
add.run(2)
```

You can subscribe `Processes` to each other and create Directed Acyclic Graphs (DAGs).

```javascript
const log = new brainsatplay.Process((self, input) => console.log(input))
add.subscribe(log) // This should output 3 to the console
add.run(2)
```

Additionally, `Processes` can be nested for more complicated behavior.
```javascript
const random = new brainsatplay.Process((self) => Math.floor(100*Math.random()))
const increment = add.set('increment', random)
log.subscribe(increment) // This will update the increment value after every run

random.run() // Initialize the random value
add.run(2)
```

To offload a `Process` to a Web Worker:
*Coming soon*

#### Events
Events are binary.

#### Behaviors
Behaviors are continuous.

### Router
*coming soon...*

### Endpoint
*coming soon...*


## Documentation
Coming soon at https://docs.brainsatplay.com

### Library Usage
#### Node.js
```bash
npm install brainsatplay
``` 

##### ES Modules
```javascript
import * as brainsatplay from 'brainsatplay'
```

##### CommonJS
```javascript
const brainsatplay = require('brainsatplay')
``` 

#### Browser
```html
<script src="https://cdn.jsdelivr.net/npm/brainsatplay@latest"></script>
```

## Roadmap
- [ ] Support Python
- [ ] Support C/C++


## Support
If you have questions about developing with Brains@Play, feel free to start a conversation on [Discord](https://discord.gg/tQ8P79tw8j) or reach out directly to our team at [contact@brainsatplay.com](mailto:contact@brainsatplay.com).


## Appendix
### Branches
The `legacy` branch of this repository contains a record of the original brainsatplay library (<= v0.0.36), which is used in the [Brains@Play Platform](https://github.com/brainsatplay/platform).

