import { Graph, GraphNode, GraphNodeProperties, OperatorType } from "../Graph";
/**
 *
 * A service extends acyclic graph to enhance networking operations and aggregate for our microservices
 *
 */
export declare type RouteProp = {
    get?: {
        object: any;
        transform: (...args: any) => any;
    } | ((...args: any) => any | void);
    post?: OperatorType | ((...args: any[]) => any | void);
    put?: (...args: any) => any | void;
    head?: (...args: any) => any | void;
    delete?: (...args: any) => any | void;
    patch?: (...args: any) => any | void;
    options?: (...args: any) => any | void;
    connect?: (...args: any) => any | void;
    trace?: (...args: any) => any | void;
    aliases?: string[];
} & GraphNodeProperties;
export declare type Routes = {
    [key: string]: GraphNode | GraphNodeProperties | Graph | OperatorType | ((...args: any[]) => any | void) | ({
        aliases?: string[];
    } & GraphNodeProperties) | RouteProp;
};
export declare type ServiceMessage = {
    route?: string;
    args?: any;
    method?: string;
    node?: string | GraphNode;
    origin?: string | GraphNode | Graph | Service;
    [key: string]: any;
};
export declare type ServiceOptions = {
    routes?: Routes | Routes[];
    name?: string;
    props?: {
        [key: string]: any;
    };
    loadDefaultRoutes?: boolean;
    [key: string]: any;
};
export declare class Service extends Graph {
    routes: Routes;
    loadDefaultRoutes: boolean;
    name: string;
    keepState: boolean;
    constructor(options?: ServiceOptions);
    load: (routes?: any, includeClassName?: boolean, routeFormat?: string) => Routes;
    unload: (routes?: Service | Routes | any) => Routes;
    handleMethod: (route: string, method: string, args?: any, origin?: string | GraphNode | Graph | Service) => any;
    handleServiceMessage(message: ServiceMessage): any;
    handleGraphNodeCall(route: string | GraphNode, args: any, origin?: string | GraphNode | Graph): any;
    transmit: (...args: any[]) => any | void;
    receive: (...args: any[]) => any | void;
    pipe: (source: GraphNode | string, destination: string, endpoint?: string | any, origin?: string, method?: string, callback?: (res: any) => any | void) => number;
    pipeOnce: (source: GraphNode | string, destination: string, endpoint?: string | any, origin?: string, method?: string, callback?: (res: any) => any | void) => void;
    terminate: (...args: any) => void;
    isTypedArray(x: any): boolean;
    recursivelyAssign: (target: any, obj: any) => any;
    defaultRoutes: Routes;
}
