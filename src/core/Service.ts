import { randomId } from "../common/id.utils"
import { RouterInterface, MessageObject, ProtocolObject, RouteConfig, SubscriptionCallbackType, MessageType } from "../common/general.types"
import { Endpoint } from './Endpoint'

// Browser and Node-Compatible Service Class
export class Service {

    id = randomId('service') // Unique Service ID
    name:string = 'service' // Service Name
    callbacks: Map<string, SubscriptionCallbackType >  = new Map() // Subscriber Callbacks
    endpoint?: Endpoint
    route?: string; // Expected server name (added in router)
    status: boolean = false // Is connected with server (set externally by router)
    serviceType: 'default' | 'subscription' = 'default'

    router: RouterInterface

    // Service-Specific Routes
    routes: RouteConfig[] = [
        // {route: 'users', delete: (self, args, id) => {}, post: (self, args, id) => {}} // Called every time a user is added or removed via the Router
    ]

    private delegate =  globalThis?.document?.createDocumentFragment();

    protocols: ProtocolObject = {} // Compatible Communication Protocols (unused in Node)
    services: {[x: string]: any} = {} // Object of nested services
    
    constructor(router?:RouterInterface) {
        this.router = router
    }


    // Event Listener Implementation
    addEventListener(...args: any): void {
        this.delegate?.addEventListener.apply(this.delegate, args);
    }

    dispatchEvent(...args: any): boolean {
        return this.delegate?.dispatchEvent.apply(this.delegate, args);
    }

    removeEventListener(...args: any): void {
        return this.delegate?.removeEventListener.apply(this.delegate, args);
    }

    setEndpointRoute = (name) => {
        this.route = name
    }


    // Notify subscribers (e.g. Router / StructsRouter ) of a New Message
    notify = async (
        o: MessageObject, // defines the route to activate
        type?: MessageType, // specifies whether the notification is internal (true) OR from a client (false / default). Internal notifications will be only forwarded to route subscribers.
        origin?: string|number|undefined //origin of the call
     ) => {
        let responses = [];

        // Notify All Subscribers
        await Promise.all(Array.from(this.callbacks).map(async (arr, i) => {
            const res = await arr[1](o, type, origin);
            if (res && !(res instanceof Error)) responses.push(res)
        }))

        // Return First Valid Subscription Response
        return responses?.[0]
    }

    // Bind Endpoint
    setEndpoint = (endpoint) => {
        this.endpoint = endpoint
    }

    // Subscribe to Notifications
    subscribe = (callback:SubscriptionCallbackType) => {
        if (callback instanceof Function){
            let id = randomId()
            this.callbacks.set(id, callback)
            return id
        } else return
    }

    // Unsubscribe from Notifications
    unsubscribe = (id:string) => {
        return this.callbacks.delete(id)
    }
}