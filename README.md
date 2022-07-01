# brainsatplay
`brainsatplay` is a framework for quickly assembling interactive, high-performance web applications. This repo is in active development so you'll see a lot of ideas still getting half baked and tossed out but you can follow our development closely if you subscribe to garrettmflynn and joshbrew on github.

Our mission is to enable open source biosensing and signal processing research, game, and education application development for everyone, We're solving a ton of typical web development problems in the process with a suite of custom frameworks leveraging the latest web APIs!

### Supporting Projects
- [**graphscript (core)**](https://github.com/brainsatplay/graphscript) provides easy graph-based workflow (state machine) programming, microservice architectures, and interoperable front and backend web frameworks!
- [**datastreams-api**](https://github.com/brainsatplay/datastreams-api) supports real-time data acquisition through the browser.
- [**visualscript**](https://github.com/brainsatplay/visualscript) allows for visual programming with the `brainsatplay` library.
- [**tinybuild**](https://github.com/brainsatplay/brainsatplay/tree/main/src/build) combines ultra fast and lightweight esbuild, hot reloading node and python (optional), and quick config/setup for webapps, npm libraries, pwas, and mobile applications.

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


## Support
If you have questions about developing with Brains@Play, feel free to start a conversation on [Discord](https://discord.gg/tQ8P79tw8j) or reach out directly to our team at [contact@brainsatplay.com](mailto:contact@brainsatplay.com).


## Appendix
### Branches
The `legacy` branch of this repository contains a record of the original brainsatplay library (<= v0.0.36), which is used in the [Brains@Play Platform](https://github.com/brainsatplay/platform).

