# brainsatplay
**brainsatplay** is a browser-centered concurrency framework for high-performance computing and inter-process communication with real-time data streams.

This repository is the core of the [Brains@Play project](https://github.com/brainsatplay/project) for developing **an ecosystem of AGPL software infrastructure for participating in biomedical research** on the Open Web

> **Note:** The `legacy` branch of this repository contains a record of the original brainsatplay library (<= v0.0.36), which is used in the [Brains@Play Platform](https://github.com/brainsatplay/platform).

## Documentation
Coming soon at https://docs.brainsatplay.com

## Roadmap
- Add datastreams-api devices as another type of endpoint
- Thread arbitrary analyses
- Simplify the monorepo and its conventions. Then provide appropriate contributor documentation.
- Integrate LSL (lsl-wasm)
- 

## Concepts
### Router
*coming soon...*

### Endpoint
*coming soon...*

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