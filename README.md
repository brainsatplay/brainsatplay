# brainsatplay
`brainsatplay` is a concurrency framework for interactive, high-performance applications controlled by the browser.

### Supporting Projects
- [**datastreams-api**](https://github.com/brainsatplay/datastreams-api) supports real-time data acquisition through the browser.
- [**visualscript**](https://github.com/brainsatplay/visualscript) allows for visual programming with the `brainsatplay` library.

### Features
🧩 **Composable:** Assemble native and custom components to satisfy your specific requirements.

⚡ **Fast:** Handle streaming data in real-time.

## Monorepo Contents
This monorepo contains several NPM libraries for high-performance computing and inter-process communication.

### /core
- **brainsatplay:** A set of generic message handlers written in Universal JavaScript.

### /frontend
- **brainsatplay-frontend:** Client-side HTTP and Websocket services.

### /backend
- **brainsatplay-backend:** Server-side HTTP and Websocket services.

### /services
- **brainsatplay-database:** Store data + router extension for data management (implemented in [MyAlyce](https://github.com/MyAlyce/myalyce)).
- **brainsatplay-webrtc:** Pass messages to peers over WebRTC.

### /cli
- **brainsatplay-cli:** Program a new project through the terminal.

### /chrome
- **Brains@Play Extension:** A Chrome Extension for using Brains@Play applications.

### /pwa
- **Brains@Play:** An example Progressive Web App using the Brains@Play software suite.

### /visualscript
- **visualscript:** Visual programming system for **brainsatplay** 

## Concepts
*List and explain all design intuitions here*

### Processes
A **Process** is a `Function` that can be stringified and offloaded (e.g. to a Web Worker, to a Node.js server, etc.).

### Inputs, Modifiers, and Outputs
```javascript
const add = new brainsatplay.Process((
    self,           // Reference to this process
    input,          // Drives execution
    increment       // Modifies input
) => {
    const output = input + increment
    return output   // Passed to other Processes
})

add.set('increment', 1) // or add.set(0, 1)
add.run(2)
```

In this example, there are two inputs (`input` and `increment`) where `input` drives the execution of the process and `increment` modifies the final `output`. 

### Assembling Processes
Each `Process` can be subscribed to, enabling the formation of Directed Acyclic Graphs (DAGs).

```javascript
const log = new brainsatplay.Process((self, input) => console.log(input))
add.subscribe(log) // This should output 3 to the console
add.run(2)
```

This prints the outcome of `add.run(2)` to the Developer Console.

### Nesting Processes
Additionally, a `Process` can be set as a modifier of another to support  complicated behaviors.
```javascript
const random = new brainsatplay.Process((self) => Math.floor(100*Math.random()))
const increment = add.set('increment', random)
log.subscribe(increment)
random.run()
add.run(2)
```

This will update the value for `increment` with a random number after every run.

### Ensure Performance
To offload a `Process` to a Web Worker:
*Coming soon*

### Router
A `Router` will host a `Process` and send outputs back to the requester.

### Socket
An `Socket` will forward data to a `Process`.

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
- [ ] Genuinely support UMD in bundler (https://github.com/evanw/esbuild/pull/1331)
- [ ] Fix ESM in bunlder
- [ ] Entirely convert Routes to Processes
- [ ] Assemble graphs in Node.js
- [ ] Assemble graphs with CLI
- [ ] Support Python
- [ ] Support C/C++
- [ ] Make Socket / Router entirely Process-centric
- [ ] Assemble / edit Processes with [visualscript](https://github.com/brainsatplay/visualscript)
- [ ] Acquire data persistently with a Chrome Extension

## Low Effort Extensions
*Coming soon...*


## Support
If you have questions about developing with Brains@Play, feel free to start a conversation on [Discord](https://discord.gg/tQ8P79tw8j) or reach out directly to our team at [contact@brainsatplay.com](mailto:contact@brainsatplay.com).


## Appendix
### Branches
The `legacy` branch of this repository contains a record of the original brainsatplay library (<= v0.0.36), which is used in the [Brains@Play Platform](https://github.com/brainsatplay/platform).

