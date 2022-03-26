import { MessageObject, UserObject } from "../common/general.types"
import { Service } from './Service'
import Router from './Router';
import { getRouteMatches } from "../common/general.utils";

// Browser and Node-Compatible Service Class
export class SubscriptionService extends Service {

    // FE
    service?: string;
    connection?: any; // Networking object connection
    responses?: Map<string, Function> = new Map()
    serviceType: 'subscription' = 'subscription'

    // Message Handler
    subscribers: Map<string, any> = new Map()
    updateSubscribers?: (router: Router, o: MessageObject) => any = (self, o) => {

        this.subscribers.forEach(u => {
            let possibilities = getRouteMatches(o.route, false)
            possibilities.forEach(route => {
                if (u.routes[route]) {
                    // Allow subscribers that aren't logged in
                    // u = self.USERS[u.id]

                    if (u?.send) {
                        u.send(self.format(o))
                    }
                }
            })
        })
    }
    
    
    constructor(router) {
        super(router)
    }

    add = (user:Partial<UserObject>, endpoint:string):Promise<any> => {
        throw 'Add not implemented'
    }

    addResponse = (name, f) => {
        this.responses.set(name, f)
    }

    removeResponse = (name) => {
        if (name) this.responses.delete(name)
        else this.responses = new Map()
    }

    send = async (o:MessageObject, options?: any):Promise<any> => {
        throw 'Send not implemented'
    }
}