/**
 * Module for creating BCI application in Javascript.
 * @module brainsatplay
 */

import * as plugins from './src/plugins/plugins.js'

// Plugins
export {plugins}

// Session Manager
export {Session} from './src/Session.js'

// Application
export {Application} from './src/Application.js'

// export * from './src/analysis/Math2'

// CommonJS Exports Not Working for Node.js Utilities
// import * as brainstorm from './src/brainstorm/Brainstorm'
// export {brainstorm}
