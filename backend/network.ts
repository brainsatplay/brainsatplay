// grab IP address on the local network
export let localIP = 'localhost'

import { networkInterfaces } from 'node:os'
try {

const nets = networkInterfaces();
const results = {}

for (const name of Object.keys(nets)) {
    const value = nets[name]
    if (value){
        for (const net of value) {
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    } 
  }
  const res = (results["en0"] ?? results["Wi-Fi"])?.[0]
  if (res) localIP = res
  else console.error('Could not get local IP address')

} catch (e) {
    console.log('Error', e)
}
    