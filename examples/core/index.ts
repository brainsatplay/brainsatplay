import * as brainsatplay from '../../src/core/src/index'

// JSON Files
// import { appInfo, options } from './demos/signals'
import {appInfo, options} from './demos/phaser'
// import {appInfo, options} from './demos/starter'

const method = 'local'
let optionsToPass = options as any
let infoToPass: any;

let app: brainsatplay.App | brainsatplay.editable.App
// ------------------- Method #1: Dynamic Import (package.json) -------------------
// NOTE: Only works when all files are served to the browser

if (method === 'remote') {
    // infoToPass = 'app' // local
    // infoToPass = 'http://127.0.0.1:5501/index.wasl.json' // pseudolocal
    // infoToPass = 'https://raw.githubusercontent.com/garrettmflynn/phaser/nightly/index.wasl.json'
    // infoToPass = 'https://raw.githubusercontent.com/brainsatplay/brainsatplay-starter-kit/nightly/index.wasl.json'
    infoToPass = 'https://raw.githubusercontent.com/brainsatplay/wasl/main/tests/0/0.0/0.0.0/external/index.wasl.json'
}

// ------------------- Method #2: Direct Import (index.js) -------------------
else infoToPass = appInfo

// Set Options
optionsToPass.parentNode = document.getElementById('app')

// Create App
app = new brainsatplay.App(
    infoToPass, // blank to select from filesystem. object to load. string to guess
    optionsToPass
)

// Start App
const start = document.getElementById('start')
const save = document.getElementById('save')
const load = document.getElementById('load')

if (start) {
    start.addEventListener('click', () => {
        app.start(undefined, optionsToPass).then((wasl) => {

            console.log('App', app)
            console.log('Errors', wasl.errors)
            console.log('Warnings', wasl.warnings)

        }).catch(e => console.error('Invalid App', e))
    })

}

if (load) {
    load.addEventListener('click', () => {

        app = new brainsatplay.App(
            undefined, // blank to select from filesystem. object to load. string to guess
            optionsToPass
        )

        if (start) start.click()
    })
}

if (save) {
    save.addEventListener('click', () => {
        app.save().catch(e => console.error('Save Error', e))
    })

}

