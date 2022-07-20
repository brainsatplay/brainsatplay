import { DOMElement } from "./DOMElement";
import { Graph, GraphNode, GraphNodeProperties, OperatorType } from '../../Graph';
import { RouteProp, Routes, Service, ServiceMessage, ServiceOptions } from "../Service";
import { CompleteOptions } from './types/general';
import { ElementOptions, ElementInfo, ElementProps } from './types/element';
import { DOMElementProps, ComponentOptions, DOMElementInfo } from './types/component';
import { CanvasElementProps, CanvasOptions, CanvasElementInfo } from './types/canvascomponent';
export declare type DOMRouteProp = (ElementProps & GraphNodeProperties) | (DOMElementProps & GraphNodeProperties) | (CanvasElementProps & GraphNodeProperties);
export declare type DOMRoutes = {
    [key: string]: GraphNode | GraphNodeProperties | Graph | OperatorType | ((...args: any[]) => any | void) | ({
        aliases?: string[];
    } & GraphNodeProperties) | RouteProp | DOMRouteProp;
};
export declare class DOMService extends Graph {
    routes: DOMRoutes;
    loadDefaultRoutes: boolean;
    name: string;
    keepState: boolean;
    parentNode: HTMLElement;
    constructor(options?: ServiceOptions, parentNode?: HTMLElement);
    elements: {
        [key: string]: ElementInfo;
    };
    components: {
        [key: string]: DOMElementInfo | CanvasElementInfo;
    };
    templates: {
        [key: string]: DOMElementProps | CanvasElementProps;
    };
    addElement: (options: ElementOptions, generateChildElementNodes?: boolean) => ElementInfo;
    createElement: (options: ElementOptions) => HTMLElement;
    updateOptions: (options: any, element: any) => CompleteOptions;
    addComponent: (options: ComponentOptions, generateChildElementNodes?: boolean) => DOMElementInfo;
    addCanvasComponent: (options: CanvasOptions) => CanvasElementInfo;
    load: (routes?: any, includeClassName?: boolean, routeFormat?: string) => DOMRoutes;
    unload: (routes?: Service | Routes | any) => DOMRoutes;
    handleMethod: (route: string, method: string, args?: any, origin?: string | GraphNode | Graph | Service) => any;
    handleServiceMessage(message: ServiceMessage): any;
    handleGraphNodeCall(route: string | GraphNode, args: any, origin?: string | GraphNode | Graph): any;
    transmit: (...args: any[]) => any | void;
    receive: (...args: any[]) => any | void;
    pipe: (source: GraphNode | string, destination: string, endpoint?: string | any, origin?: string, method?: string, callback?: (res: any) => any | void) => number;
    pipeOnce: (source: GraphNode | string, destination: string, endpoint?: string | any, origin?: string, method?: string, callback?: (res: any) => any | void) => void;
    terminate: (element: string | DOMElement | HTMLElement | DOMElementInfo | CanvasElementInfo) => boolean;
    isTypedArray(x: any): boolean;
    recursivelyAssign: (target: any, obj: any) => any;
    defaultRoutes: DOMRoutes;
}
/**
 * Usage
 */
