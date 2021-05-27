/**
 * Module for creating BCI application in Javascript.
 * @module brainsatplay
 */

 // Default CSS Stylesheet
 import './src/ui/styles/defaults.css'

// Plugins
import * as plugins from './src/plugins/plugins.js'
export {plugins}

// Session Manager
export {Session} from './src/Session.js'

// Application
export {Application} from './src/Application.js'

// export * from './src/analysis/eegmath'


// import * as brainstorm from './src/brainstorm/Brainstorm'
// import * as workers from './src/Workers.js'
// export {workers}
// export {brainstorm}
