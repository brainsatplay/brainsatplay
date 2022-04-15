# brainsatplay
`brainsatplay` enables on-browser **interactive reactive programming** for high-performance scientific computing applications that span multiple programming environments. 

We believe that physiological signals represent the next frontier of interactive programming—beyond traditional events such as mouse movements and button presses.

### Supporting Projects
- [**brainsatplay-cli**](https://github.com/brainsatplay/brainsatplay-cli) makes it easy to configure a new project using the terminal.
- [**datastreams-api**](https://github.com/brainsatplay/datastreams-api) supports real-time data acquisition through the browser.
- [**visualscript**](https://github.com/brainsatplay/visualscript) allows for visual programming with the `brainsatplay` library.

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

## Concepts
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

### Endpoint
An `Endpoint` will forward data to a `Process`.

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
- [ ] Support animation loops that generate data rather than pass it.
- [ ] Assemble graphs in Node.js
- [ ] Support Python
- [ ] Support C/C++


## Support
If you have questions about developing with Brains@Play, feel free to start a conversation on [Discord](https://discord.gg/tQ8P79tw8j) or reach out directly to our team at [contact@brainsatplay.com](mailto:contact@brainsatplay.com).


## Appendix
### Branches
The `legacy` branch of this repository contains a record of the original brainsatplay library (<= v0.0.36), which is used in the [Brains@Play Platform](https://github.com/brainsatplay/platform).

