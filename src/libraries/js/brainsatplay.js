/**
 * Module for creating BCI application in Javascript.
 * @module brainsatplay
 */

import 'regenerator-runtime/runtime' 

// Plugins
import * as plugins from './src/plugins/plugins'
export {plugins}
// import {pluginManifest} from './src/plugins/pluginManifest'
// export {pluginManifest}

// Session Manager
export {Session} from './src/Session.js'

// App
export {App} from './src/App.js'

// export * from './src/analysis/Math2'

// CommonJS Exports Not Working for Node.js Utilities
// import * as brainstorm from './src/brainstorm/Brainstorm'
// export {brainstorm}

