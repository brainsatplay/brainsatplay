import * as brainsatplay from '../../src/core/src/index'

// JSON Files
// import { appInfo, options } from './demos/signals'
// import {appInfo, options} from './demos/phaser'
import {appInfo, options} from './demos/starter'

const method = 'remote'

let app: brainsatplay.App | brainsatplay.editable.App
// ------------------- Method #1: Dynamic Import (package.json) -------------------
// NOTE: Only works when all files are served to the browser

if (method === 'remote') {
    // const local = 'app'
    const remote = 'http://127.0.0.1:5501/index.wasl.json'
    // const remote = 'https://raw.githubusercontent.com/brainsatplay/brainsatplay-starter-kit/main/index.wasl.json'
    // app = new brainsatplay.editable.App(remote)
    app = new brainsatplay.App(remote)//, options)    

    // app = new brainsatplay.editable.App(local)
    // app = new brainsatplay.editable.App() // select from filesystem
}

// ------------------- Method #2: Direct Import (index.js) -------------------
else {
    // app = new brainsatplay.editable.App(appInfo)
    app = new brainsatplay.App(appInfo, options)    
}

app.start().then((ok) => {
    console.log('App', app)

    if (!ok) {
        console.log('Errors', app.options.errors)
        console.log('Warnings', app.options.warnings)
    }
}).catch(e => console.error('Invalid App', e))