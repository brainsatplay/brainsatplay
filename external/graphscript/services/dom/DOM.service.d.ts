import { DOMElement } from "./DOMElement";
import { Graph, GraphNode, GraphNodeProperties, OperatorType } from '../../Graph';
import { RouteProp, Service, ServiceOptions } from "../Service";
import { CompleteOptions } from './types/general';
import { ElementOptions, ElementInfo, ElementProps } from './types/element';
import { DOMElementProps, ComponentOptions, DOMElementInfo } from './types/component';
import { CanvasElementProps, CanvasOptions, CanvasElementInfo } from './types/canvascomponent';
export declare type DOMRouteProp = ElementProps | DOMElementProps | CanvasElementProps;
export declare type DOMServiceRoute = GraphNode | GraphNodeProperties | Graph | OperatorType | ((...args: any[]) => any | void) | ({
    aliases?: string[];
} & GraphNodeProperties) | RouteProp | DOMRouteProp;
export declare type DOMRoutes = {
    [key: string]: DOMServiceRoute;
};
export declare class DOMService extends Service {
    loadDefaultRoutes: boolean;
    keepState: boolean;
    parentNode: HTMLElement;
    name: string;
    customRoutes: ServiceOptions["customRoutes"];
    customChildren: ServiceOptions["customChildren"];
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
    terminate: (element: string | DOMElement | HTMLElement | DOMElementInfo | CanvasElementInfo) => boolean;
    defaultRoutes: DOMRoutes;
}
/**
 * Usage
 */
