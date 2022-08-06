import { Graph, GraphNode, GraphNodeProperties } from "../../../Graph";
import { CanvasElementProps } from "./canvascomponent";
import { DOMElementProps } from "./component";
export declare type ElementProps = GraphNodeProperties & {
    tagName?: string;
    element?: HTMLElement;
    style?: Partial<CSSStyleDeclaration>;
    attributes?: {
        [key: string]: any;
    };
    parentNode?: string | HTMLElement;
    onrender?: (self: HTMLElement, info: ElementInfo) => void;
    onresize?: (ev: any, self: HTMLElement, info: ElementInfo) => void;
    ondelete?: (self: HTMLElement, info: ElementInfo) => void;
    innerText?: string;
    innerHTML?: string;
    id?: string;
    children?: {
        [key: string]: string | boolean | undefined | GraphNodeProperties | GraphNode | Graph | DOMElementProps | ElementProps | CanvasElementProps;
    };
    generateChildElementNodes?: boolean;
};
export declare type ElementInfo = {
    element: HTMLElement;
    node: GraphNode;
    parentNode: HTMLElement;
    divs: any[];
} & ElementProps;
export declare type ElementOptions = GraphNodeProperties & {
    tagName?: string;
    element?: HTMLElement;
    style?: Partial<CSSStyleDeclaration>;
    attributes?: {
        [key: string]: any;
    };
    parentNode?: string | HTMLElement;
    onrender?: (self: HTMLElement, info: ElementInfo) => void;
    onresize?: (ev: any, self: HTMLElement, info: ElementInfo) => void;
    onremove?: (self: HTMLElement, info: ElementInfo) => void;
    innerText?: string;
    innerHTML?: string;
    children?: {
        [key: string]: string | boolean | undefined | GraphNodeProperties | GraphNode | Graph | DOMElementProps | ElementProps | CanvasElementProps;
    };
    id?: string;
};
