import 'regenerator-runtime/runtime'


//import './app.js'
import './managerapp.js'

// GF: Snowpack requires us to set this ourselves...
window.process = { env: {NODE_ENV: 'development' }}

if (process.env.NODE_ENV === 'development') {
    console.log('DEV MODE');
}

// GF: serviceWorker import is not working 
if (process.env.NODE_ENV === 'production') {    
    if(!(navigator as any).serial)
        alert("navigator.serial not found! Enable #enable-experimental-web-platform-features in chrome://flags (search 'experimental')")
	
		// import serviceWorker from './service-worker';

	const serviceWorker = require('./service-worker')
	// If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    serviceWorker.register();
}
