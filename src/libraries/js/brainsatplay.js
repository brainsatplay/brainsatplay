/**
 * Module for creating BCI application in Javascript.
 * @module brainsatplay
 */

// Plugins
import * as plugins from './src/plugins/plugins.js'
export {plugins}
// import {pluginManifest} from './src/plugins/pluginManifest'
// export {pluginManifest}

// Session Manager
export {Session} from './src/Session.js'

// Application
export {Application} from './src/Application.js'

// export * from './src/analysis/Math2'

// CommonJS Exports Not Working for Node.js Utilities
// import * as brainstorm from './src/brainstorm/Brainstorm'
// export {brainstorm}
