import osc from "osc"
import { DONOTSEND } from "../../core_old/index";
import { SubscriptionService } from "../../core_old/SubscriptionService";

// Garrett Flynn, AGPL v3.0

class OSCService extends SubscriptionService {
    name = 'osc'
    static type = 'backend'

    ports = []   

    constructor(router){
        super(router)

        this.routes = [
            { 
                route:'startOSC',
                post: async (self,graphOrigin,router,origin,...args) => {
                    return await this.addPort(args[0],args[1],args[2],args[3])
                }
              },
              { 
                route:'sendOSC',
                post:(self,graphOrigin,router,origin,...args) => {
                    // const u = self.USERS[origin]
                    // if (!u) return false

                    // console.log(u)
                    // if (args.length > 2) if (u.osc) u.osc.sendOverOSC(args[0],args[1],args[2]);
                    // else 
                    this.sendOverOSC(args[0]); // TODO: OSC ports can be managed as 'users'
                  return DONOTSEND;
                }
              },
              { 
                route:'stopOSC',
                post:(self,graphOrigin,router,origin,...args) => {
                  if(this.remove(args[0], args[1])) return true;
                }
              }
        ]
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
        return info;
    }

    sendOverOSC(dict, port?) {
        if (!port){
            this.ports.forEach(o => {
                o.send(this.encodeMessage(dict))
            });
            return true;
        } else port.send(this.encodeMessage(dict))
    }

    encodeMessage(message={test: 'hello'}){
        let bundle = {
            timeTag: osc.timeTag(0),
            packets: []
        }
        for (let key in message){
            let args = []
            if (!Array.isArray(message[key])) message[key] = [message[key]]
            message[key].forEach(v => {
                args.push({value: v})
            })
            bundle.packets.push({address: `/brainsatplay/${key}`, args: message[key]})
        }

        return bundle;
    }

    async addPort(localAddress="127.0.0.1",localPort=57120, remoteAddress=localAddress, remotePort=57121) {

        return new Promise(resolve => {
        if (typeof localAddress === 'string' && typeof remoteAddress === 'string'){
            let port = new osc.UDPPort({
                localAddress,
                localPort,
                remoteAddress,
                remotePort
            });

            port.on("ready", () => {
                this.ports.push(port)
                resolve({route: 'oscInfo', message: [port.options]})
            });

            port.on("error", (error) => {
                resolve({route: 'oscError', message:  [error.message]})
                this.notify({route: 'oscError', message: [error.message]}) // reach subscribers
            });

            port.on("message", (o) => {
                console.log('OSC Data', o)
                if (o.args[0] === 'brainsatplay_route') {
                    let parsed:any = {route: o.args[1]}
                    for (let i = 2; i < o.args.length; i+=2){
                        parsed[o.args[i]] = o.args[i+1]
                    }
                    parsed.message = (parsed.method) ? o.args.slice(4) : o.args.slice(2)
                    let res = this.notify(parsed) // reach subscribers and run a route
                    this.sendOverOSC(res, port)
                }
                else this.notify({route: this.name + o.address, message: o.args}) // reach subscribers and run a route
                this.notify({route: this.name + o.address, message: o.args}) // reach subscribers and run a route
            });

            port.on("close", (message) => {
                this.notify({route: 'oscClosed', message: [message]}) // reach subscribers
            })
            
            port.open();
        }
    })
    }

    remove(localAddress?, localPort?, remoteAddress?, remotePort?) {
        if (!localAddress || !localPort || !remoteAddress || !remotePort){
            this.ports.forEach(o => {
                o.close()
            })
            this.ports = [];
            return true;
        } else {
            let found = this.ports.find((o,i) => {
                if (o.options.localAddress === localAddress && o.options.localPort === localPort && o.options.remotePort === remotePort && o.options.remoteAddress === remoteAddress){
                    o.close()
                    this.ports.splice(i,1)
                    return true
                }
            })
            if(found) return true;
            else return undefined;
        }
    }
}

export default OSCService