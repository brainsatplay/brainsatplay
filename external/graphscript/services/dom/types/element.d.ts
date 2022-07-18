import { GraphNode, GraphNodeProperties } from "../../../Graph";
export declare type ElementProps = {
    tagName?: string;
    element?: HTMLElement;
    style?: CSSStyleDeclaration;
    attributes?: {
        [key: string]: any;
    };
    parentNode?: string | HTMLElement;
    oncreate?: (self: HTMLElement, info: ElementInfo) => void;
    onresize?: (ev: any, self: HTMLElement, info: ElementInfo) => void;
    ondelete?: (self: HTMLElement, info: ElementInfo) => void;
    innerText?: string;
    innerHTML?: string;
    id?: string;
};
export declare type ElementInfo = {
    element: HTMLElement;
    node: GraphNode;
    parentNode: HTMLElement;
    divs: any[];
} & ElementProps;
export declare type ElementOptions = {
    tagName?: string;
    element?: HTMLElement;
    style?: CSSStyleDeclaration;
    attributes?: {
        [key: string]: any;
    };
    parentNode?: string | HTMLElement;
    oncreate?: (self: HTMLElement, info: ElementInfo) => void;
    onresize?: (ev: any, self: HTMLElement, info: ElementInfo) => void;
    ondelete?: (self: HTMLElement, info: ElementInfo) => void;
    innerText?: string;
    innerHTML?: string;
    id?: string;
} & GraphNodeProperties;
