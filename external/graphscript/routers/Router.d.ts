/// <reference types="node" />
import { Graph, GraphNode } from "../Graph";
import { Routes, Service, ServiceMessage, ServiceOptions } from '../services/Service';
export declare type Protocol = 'http' | 'wss' | 'sse' | 'webrtc' | 'osc' | 'worker' | 'ble' | 'serial' | 'unsafe' | 'struct' | 'fs' | 'lsl' | 'hdf5' | 'unity' | 'e2ee';
export declare type RouterOptions = {
    linkServices?: boolean;
    includeClassName?: boolean;
    loadDefaultRoutes?: boolean;
    routeFormat?: string;
    customRoutes?: ServiceOptions['customRoutes'];
    customChildren?: ServiceOptions['customChildren'];
};
export declare class Router {
    id: string;
    service: Service;
    nodes: Map<any, any>;
    run: (node: string | GraphNode, ...args: any[]) => any;
    _run: (node: string | GraphNode, origin?: string | GraphNode | Graph, ...args: any[]) => any;
    add: (node?: GraphNode | import("../Graph").GraphNodeProperties | import("../Graph").OperatorType | ((...args: any[]) => any)) => GraphNode | import("../Graph").GraphNodeProperties;
    remove: (node: string | GraphNode) => string | GraphNode;
    stopNode: (node: string | GraphNode) => void;
    subscribe: (node: string | GraphNode, callback: (res: any) => void) => number;
    unsubscribe: (tag: string, sub: number) => void;
    get: (tag: string) => any;
    reconstruct: (json: string | {
        [x: string]: any;
    }) => GraphNode | import("../Graph").GraphNodeProperties;
    setState: (updateObj: {
        [key: string]: any;
    }) => {};
    recursivelyAssign: (target: any, obj: any) => any;
    state: {
        pushToState: {};
        data: {};
        triggers: {};
        setState(updateObj: {
            [key: string]: any;
        }): {};
        subscribeTrigger(key: string, onchange: (res: any) => void): number;
        unsubscribeTrigger(key: string, sub: number): boolean;
        subscribeTriggerOnce(key: string, onchange: (res: any) => void): void;
    };
    routes: Routes;
    services: {
        [key: string]: Service;
    };
    loadDefaultRoutes: boolean;
    [key: string]: any;
    constructor(services?: (Service | Graph | Routes | any)[] | {
        [key: string]: Service | Graph | Routes | any;
    } | any[], options?: RouterOptions);
    load: (service: Graph | Routes | {
        name: string;
        module: any;
    } | any, linkServices: boolean, includeClassName: boolean, routeFormat: string, customRoutes: ServiceOptions["customRoutes"], customChildren: ServiceOptions["customChildren"]) => Service;
    pipe: (source: string | GraphNode, destination: string, transmitter?: Protocol | string, origin?: string, method?: string, callback?: (res: any) => any | void) => number | false;
    pipeOnce: (source: string | GraphNode, destination: string, transmitter?: Protocol | string, origin?: string, method?: string, callback?: (res: any) => any | void) => false | void;
    sendAll: (message: ServiceMessage | any, connections: {
        [key: string]: {
            [key: string]: any;
        };
    }, channel?: string) => boolean;
    getEndpointInfo: (path: string, service?: string) => {
        endpoint: any;
        service: string;
    };
    pipeFastest: (source: string | GraphNode, destination: string, origin?: string, method?: string, callback?: (res: any) => any | void, services?: {
        [key: string]: Service;
    }) => number | false;
    getFirstRemoteEndpoint: (services?: {
        [key: string]: Service;
    }) => any;
    STREAMLATEST: number;
    STREAMALLLATEST: number;
    streamSettings: {
        [key: string]: {
            object: {
                [key: string]: any;
            };
            settings: {
                keys?: string[];
                callback?: 0 | 1 | Function;
                lastRead?: number;
                [key: string]: any;
            };
        };
    };
    streamFunctions: any;
    setStreamFunc: (name: string, key: string, callback?: 0 | 1 | Function) => boolean;
    addStreamFunc: (name: any, callback?: (data: any) => void) => void;
    setStream: (object?: {}, settings?: {
        keys?: string[];
        callback?: Function;
    }, streamName?: string) => {
        object: {
            [key: string]: any;
        };
        settings: {
            [key: string]: any;
            keys?: string[];
            callback?: 0 | 1 | Function;
            lastRead?: number;
        };
    };
    removeStream: (streamName: any, key: any) => boolean;
    updateStreamData: (streamName: any, data?: {}) => false | {
        [key: string]: any;
    };
    streamLoop: (connections?: {
        [key: string]: {
            [key: string]: any;
        };
    }, channel?: string) => {};
    receive: (message: any | ServiceMessage, service?: Protocol | string, ...args: any[]) => any;
    transmit: (message: any | ServiceMessage, service?: Protocol | string, ...args: any[]) => any;
    defaultRoutes: Routes;
}
