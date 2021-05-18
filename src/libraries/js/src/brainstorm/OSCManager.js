let osc = require("osc")

class OSCManager{
    constructor(ws){
        this.socket = ws
        this.ports = []     
    }

    info(){
        // var ipAddresses = getIPAddresses();
        let data = []
        this.ports.forEach((p) => {
            data.push({
                localAddress: p.options.localAddress, 
                localPort: p.options.localPort,
                remoteAddress: p.options.remoteAddress, 
                remotePort: p.options.remotePort
            })
        });
        return data
    }

    add(localAddress="127.0.0.1",localPort=57121, remoteAddress=null, remotePort=null) {
        // Note: Can we structure this on the client side as a Chrome app?
        let port = new osc.UDPPort({
            localAddress,
            localPort,
            remoteAddress,
            remotePort
        });

        port.on("ready", () => {
            let info = this.info()
            this.socket.send(JSON.stringify({msg:'oscInfo', created: true, oscInfo: info}))
        });

        port.on("error", (error) => {
            this.socket.send(JSON.stringify({msg:'oscError', oscError: error.message}))
        });

        port.on("message", (oscMsg) => {
            this.socket.send(JSON.stringify({msg:'oscData', oscData: oscMsg}))
        });

        port.on("close", (msg) => {})
        
        try {
            port.open();
        } catch (err) {
            console.log('caught an error')
        }

        this.ports.push(port)
    }

    remove(localAddress, localPort) {
        if (localAddress == null && localPort == null){
            this.ports.forEach(o => {
                o.close()
            })
            this.ports = []
        } else {
            let found = this.ports.find((o,i) => {
                if (o.options.localAddress === localAddress && o.options.localPort === localPort){
                    o.close()
                    this.ports.splice(i,1)
                    return true
                }
            })
            if(found) { this.socket.send(JSON.stringify({msg:'oscStopped',id:{address: localAddress, port: localPort}}));}
            else { this.socket.send(JSON.stringify({msg:'streamNotFound',id:{address: localAddress, port: localPort}}));}
        }
    }
}

module.exports = OSCManager