import * as brainsatplay from '../../src/core/src/index'

// JSON Files
// import { appInfo, options } from './demos/signals'
import {appInfo, options} from './demos/phaser'
// import {appInfo, options} from './demos/starter'

const method = 'remote'
const edit = true

let optionsToPass = options as any
let infoToPass: any;

let app: brainsatplay.App | brainsatplay.editable.App
// ------------------- Method #1: Dynamic Import (package.json) -------------------
// NOTE: Only works when all files are served to the browser

if (method === 'remote') {
    // infoToPass = 'app' // local
    // infoToPass = 'http://127.0.0.1:5501/index.wasl.json' // pseudolocal
    infoToPass = 'https://raw.githubusercontent.com/brainsatplay/wasl/main/tests/0/0.0/0.0.0/external/index.wasl.json'
}

// ------------------- Method #2: Direct Import (index.js) -------------------
else infoToPass = appInfo

// Set Options
optionsToPass.parentNode = document.getElementById('app')
optionsToPass.edit = edit

let createApp = async (infoToPass?) => {
    
    // Create App
    app = new brainsatplay.App(
        infoToPass, // blank to select from filesystem. object to load. string for local
        optionsToPass
    )

}

const start = document.getElementById('start')
const save = document.getElementById('save')
const load = document.getElementById('load')
let correction = () => {}

if (start) {

    createApp(infoToPass) // correct load event
    
    start.addEventListener('click', async () => {

        await app.start(undefined, optionsToPass).then((wasl) => {

            if (wasl){
                console.log('App', app)
                console.log('Errors', wasl.errors)
                console.log('Warnings', wasl.warnings)
            }

        }).catch(e => console.error('Invalid App', e))

        correction()
        correction = () => {}

    })

}

if (load) {
    load.addEventListener('click', () => {

        createApp()
        correction = () => createApp(infoToPass) // correct load event

        if (start) start.click()
    })
}

if (save) {
    save.addEventListener('click', () => {
        app.save().catch(e => console.error('Save Error', e))
    })

}

