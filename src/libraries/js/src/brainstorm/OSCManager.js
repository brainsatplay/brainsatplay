let osc = require("osc")

class OSCManager{
    constructor(ws){
        this.socket = ws
        this.ports = []     
    }

    info(){
        // var ipAddresses = getIPAddresses();
        let info = []
        this.ports.forEach((p) => {
            info.push({
                localAddress: p.options.localAddress, 
                localPort: p.options.localPort,
                remoteAddress: p.options.remoteAddress, 
                remotePort: p.options.remotePort
            })
        });
        return info
    }

    send(dict, localAddress, localPort) {
        if (localAddress == null && localPort == null){
            this.ports.forEach(o => {
                o.send(this.encodeMessage(dict))
            })
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

    encodeMessage(msg){
        let bundle = {
            timeTag: osc.timeTag(0),
            packets: []
        }
        for (let key in msg){
            let args = []
            if (!Array.isArray(msg[key])) msg[key] = [msg[key]]
            msg[key].forEach(v => {
                args.push({value: v})
            })
            bundle.packets.push({address: `/brainsatplay/${key}`, args: msg[key]})
        }
        return bundle
    }

    add(localAddress="127.0.0.1",localPort=57121, remoteAddress=null, remotePort=null) {

        let port = new osc.UDPPort({
            localAddress,
            localPort,
            remoteAddress,
            remotePort
        });

        port.on("ready", () => {
            this.ports.push(port)
            this.socket.send(JSON.stringify({msg:'oscInfo', oscInfo: this.info()}))
        });

        port.on("error", (error) => {
            if (error.code === 'EADDRINUSE') {this.socket.send(JSON.stringify({msg:'oscInfo', oscInfo: this.info()}))}
            else this.socket.send(JSON.stringify({msg:'oscError', oscError: error.message}))
        });

        port.on("message", (oscMsg) => {
            this.socket.send(JSON.stringify({msg:'oscData', oscData: oscMsg}))
        });

        port.on("close", (msg) => {})
        
        port.open();
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