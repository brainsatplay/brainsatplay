import 'regenerator-runtime/runtime'
import './Platform.js'
// import './SingleApplet.js'

window.process = { env: {NODE_ENV: 'development' }}

if (process.env.NODE_ENV === 'development') {
    console.log('DEV MODE');
}

if (process.env.NODE_ENV === 'production') {    
    if(!(navigator as any).serial)
        alert("navigator.serial not found! Enable #enable-experimental-web-platform-features in chrome://flags (search 'experimental')")
	const serviceWorker = require('./service-worker')
    serviceWorker.register();
}