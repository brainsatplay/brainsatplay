import { Router } from '../core/Router'
import { Endpoint } from '../core/Endpoint'
export type RouterInterface = Partial<Router>

export type ArbitraryObject = {[x:string]:any}

export type RouteConfig = {
    route: string, // Route Name
    id?: string, // Basic identifier for Clients
    private?: boolean, // Hide Route from Router 'routes' function (TODO: can still be called from knowledgeable clients...)
    aliases?: string[], // Name aliases
    protocols?: ProtocolObject // Networking constraints
    headers?: any // Specify headers
    service?: string, // Service name

    args?: string[] // Derived argument names from Post

    // Methods
    get?: any | {
        object: any,
        transform: (o, ...args) => any
    }, // Reference to an object that notifies subscribers on change
    post?: (self: Router, args: any[], id: string) => any,
    delete?: (self: Router, args: any[], id: string) => any
}

export type RouterOptions = {
    endpoints?: EndpointConfig[]
    debug?:boolean 
    safe?:boolean
    interval?:number
  }

  export type EndpointType = 'http' | 'websocket' | 'webrtc'

export type EndpointConfig = string | URL | {
    type?: EndpointType
    target?: string|URL,
    link?: Endpoint
    credentials: Partial<UserObject>
  }

export type RouteSpec = string | {
    route: string,
    endpoint?: Endpoint // === id
    service?: string
    // id?: string // id
}

export type SubscriptionCallbackType = (o:MessageObject, name?: MessageType, origin?:string|number|undefined) => any 

export type ProtocolObject = {
    websocket?: boolean,
    http?: boolean,
    osc?: boolean
}

export type AllMessageFormats = MessageObject | string | any[] 

export type MessageObject = {
    // NOTE: Most have route OR message
    id?: string;
    _id?: string;
    route?: string; // what to do at the endpoint
    method?: FetchMethods, // Method constraints
    callbackId?: string; // unique id for the request (stored client-side)
    message?: [] | any // data passed,
    suppress?: boolean,
    headers?: {[x: string] : string}
    block?: boolean
  }

export type ClientObject = {
    id: string,
    routes: Map<string, RouteConfig>
}

export type SettingsObject = {
    id?: string
    appname?: string
    type?: string
    object?: {}
    propnames?: string[]
    settings?: {
        keys?: any[]
    }
}

export type MessageType = 'local' | 'remote' | 'subscribers'

export type FetchMethods = 'GET' | 'POST' | 'DELETE'

export type UserObject = {
    id:string, 
    _id:string, //second reference (for mongodb parity)
    username:string,
    password?: string,
    origin:string,
    send?: Function, // Send a message back to the client
    webrtc?: RTCPeerConnection // Client-side
    props: {},
    updatedPropNames: string[],
    sessions:string[],
    blocked:string[], //blocked user ids for access controls
    lastUpdate:number,
    lastTransmit:number,
    latency:number,
    routes: Map<string, RouteConfig>

    // To Determine if Useful
    userRoles?: {}
    email?: string,
    phone?: string,
    socials?: {},
    data?: {}
  }