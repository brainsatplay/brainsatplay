# brainsatplay
High-Performance Computing on Real-Time Data

This repository is the core of the [Brains@Play project](https://github.com/brainsatplay/project) for developing **an ecosystem of AGPL software infrastructure for participating in biomedical research** on the Open Web

> **Note:** The `legacy` branch of this repository contains a record of the original brainsatplay library (<= v0.0.36), which is used in the [Brains@Play Platform](https://github.com/brainsatplay/platform).

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

## Support
If you have questions about developing with Brains@Play, feel free to start a conversation on [Discord](https://discord.gg/tQ8P79tw8j) or reach out directly to our team at [contact@brainsatplay.com](mailto:contact@brainsatplay.com).
