import * as brainsatplay from '../../src/core/src/index'

// JSON Files
import appInfo from '../../../htil/content/signals/index.js'
// import appInfo from '../../../brainsatplay-starter-kit/index.js'
const method = 1

let app:brainsatplay.App
// ------------------- Method #1: Dynamic Import -------------------
// NOTE: Only works when all files are served to the browser

if (method === 0) {
    app = new brainsatplay.App() // e.g. 'app'
}

// ------------------- Method #2: Direct Import -------------------
else if (method === 1) {
    app = new brainsatplay.App(appInfo)
}

// ------------------- Method #3: Remote URL -------------------
else {
    const remoteURL = 'https://raw.githubusercontent.com/brainsatplay/brainsatplay-starter-kit/nightly'
    app = new brainsatplay.App(remoteURL)
}

app.start().then(() => console.log(app))