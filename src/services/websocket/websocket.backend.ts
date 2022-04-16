// Joshua Brewster, Garrett Flynn, AGPL v3.0
import { WebSocketServer } from 'ws'
import { SubscriptionService } from '../../core/SubscriptionService'
import { MessageObject } from '../../common/general.types';
import { pseudoObjectId } from '../../common/id.utils';

// Create WS Server Instance
class WebsocketService extends SubscriptionService {

  static type = 'backend'
  name = 'websocket'
  server: any
  wss = new WebSocketServer({ clientTracking: false, noServer: true });


    constructor(router, httpServer){
      super(router)

      this.server = httpServer

      this.init()
}


    async init() {

        this.server.on('upgrade', async (request, socket, head) => {
              this.wss.handleUpgrade(request, socket, head, (ws) => {
                this.wss.emit('connection', ws, request);
              });
        });
        
        
        // Connect Websocket
        this.wss.on('connection',  async (ws, req) => {

          const subprotocols:{[x:string]: any} = {}
          let subArr = decodeURIComponent(ws.protocol).split(';')
          subArr.forEach((str) => {
            if (str){
              let subSplit = str.split('/')
              let [val, query] = subSplit[2].split('?')

              const queries: {
                [x: string]: any
                arr?: string
              } = {}

              query.split('&').forEach(str => {
                const [key,val] = str.split('=')
                queries[key] = val
              })

              subprotocols[subSplit[1]] = (queries.arr === 'true') ? val.split(',') : val
            }
          })

            // subprotocols should look like:
            /*
              message = {
                id:'abc123' //unique identifier, or use _id:
                username:'agentsmith' //ideally a unique username
              }
            */

            const msg = await this.notify({route: 'addUser', message: [Object.assign(subprotocols, {send: (data) => {
              if(ws.readyState === 1) ws.send(JSON.stringify(data))
            }})]});

            ws.on('message', (json) => {

              let parsed = JSON.parse(json);

              if(Array.isArray(parsed)) { //push arrays of requests instead of single objects (more optimal potentially, though fat requests can lock up servers)
                  parsed.forEach((obj) => {
                    // if (!obj.id) obj.id = msg.id // DO NOT ALLOW FOR TRACKING
                    this.process(ws, obj);
                  })
              } else {
                // if (!parsed.id) parsed.id = msg.id
                this.process(ws, parsed)
              }
          });

          ws.on('close', (s) => console.log('WS closed'));
        });   
    }

  process = async (ws, o) => {

    let res = await this.defaultCallback(ws, o) // Get default answer (subscription)
    
    // Try Command Elsewhere (if no response)
    if (!res) res = await this.notify(o);

    if (typeof res === 'object') res.callbackId = o.callbackId
    if (res instanceof Error) ws.send(JSON.stringify(res, Object.getOwnPropertyNames(res))) 
    else if (res != null) ws.send(JSON.stringify(res)) // send back  
  }

  defaultCallback = async (ws, o) => {

      // Check to Add Subscribers (only ws)
      let query = `${this.name}/subscribe`
      if (o.route.slice(0,query.length) === query){
          return await this.addSubscription(o, ws)
      }

  } 

    // Subscribe to Any Arbitrary Route Event
    addSubscription = async (info: MessageObject, ws) => {

      const id = info.id ?? pseudoObjectId() // Manage Subscriptions without ID
      const routes = info.message?.[0]
      let u = this.subscribers.get(id)

      if (!u){
          u = {id, routes: {}, send: (o:any) => {
            console.log('TRYING TO SEND', o.message, o.route)
            if(o.message && o.route) {
                ws.send(JSON.stringify(o))
            }
          }}

          // Cancel Subscriptions
          ws.on('close', () => {
            this.subscribers.delete(id)
        });

          // u.id = id
          this.subscribers.set(id, u)
      } 

        routes?.forEach(async route => {
            u.routes[route] = true
        })

        return {}
    }
}

export default WebsocketService
