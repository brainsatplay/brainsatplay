import * as brainsatplay from '../../src/core/src/index'

// JSON Files
import appInfo from '../../../brainsatplay-starter-kit/index.js'
const method = 1

// ------------------- Method #1: Dynamic Import -------------------
// NOTE: Only works when all files are served to the browser

if (method === 0) {
    const app = new brainsatplay.App() // e.g. 'app'
    app.start().then(() => console.log(app))
}

// ------------------- Method #2: Direct Import -------------------
else if (method === 1) {

    const app = new brainsatplay.App(appInfo)

    // Start App
    app.start().then(() => () => console.log(app))
}

// ------------------- Method #3: Remote URL -------------------
else if (method === 2) {
    const remoteURL = 'https://raw.githubusercontent.com/brainsatplay/brainsatplay-starter-kit/nightly'
    const remote = new brainsatplay.App(remoteURL)
    remote.start().then(() => console.log(remote))
}