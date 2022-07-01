# brainsatplay
`brainsatplay` is a framework for quickly assembling interactive, high-performance web applications. 

Our mission is to enable open source biosensing and signal processing research, game, and education application development for everyone, We're solving a ton of typical web development problems in the process with a suite of custom frameworks leveraging the latest web APIs!

### Supporting Projects
- [**graphscript (core)**](https://github.com/brainsatplay/graphscript) provides easy graph-based workflow (state machine) programming, microservice architectures, and interoperable front and backend web frameworks!
- [**datastreams-api**](https://github.com/brainsatplay/datastreams-api) supports real-time data acquisition through the browser.
- [**visualscript**](https://github.com/brainsatplay/visualscript) allows for visual programming with the `brainsatplay` library.
- [**tinybuild**](https://github.com/brainsatplay/brainsatplay/tree/main/src/build) combines ultra fast and lightweight esbuild, hot reloading node and python (optional), and quick config/setup via boilerplate.

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

