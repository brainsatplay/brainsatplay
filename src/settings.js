// grab IP address on the local network
export let localIP = 'localhost'
try {
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = {}

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
  }
  console.log('Network Structure (no IPv4 or internal):', results)
  localIP = results["en0"][0]
} catch {}


// Set Server Settings
export const settings = {
    "protocol": "http",
    "hosturl" : localIP,
    "port"    : "80",          //base port
    "port2"   : "81",          //second port, add whatever you need
    "docusaurus" : "3000"      //this port is set in the docusaurus package.json
}

//exports.default = settings;