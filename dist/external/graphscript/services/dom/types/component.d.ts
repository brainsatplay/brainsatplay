import { DOMElement } from "../DOMElement";
import { GraphNode, GraphNodeProperties } from "../../../Graph";
export declare type DOMElementProps = {
    tagName?: string;
    template?: string | ((props: any) => string | HTMLElement) | HTMLElement;
    parentNode?: string | HTMLElement;
    styles?: string;
    oncreate?: (self: DOMElement, info?: DOMElementInfo) => void;
    onresize?: (self: DOMElement, info?: DOMElementInfo) => void;
    ondelete?: (self: DOMElement, info?: DOMElementInfo) => void;
    onchanged?: (props: any) => void;
    renderonchanged?: boolean | ((self: DOMElement, info: DOMElementInfo) => void);
    innerText?: string;
    innerHTML?: string;
    id?: string;
    generateChildElementNodes?: boolean;
} & GraphNodeProperties;
export declare type DOMElementInfo = {
    element: DOMElement;
    class: any;
    node: GraphNode;
    divs: any[];
} & DOMElementProps;
export declare type ComponentOptions = {
    tagName?: string;
    template?: string | ((props: any) => string | HTMLElement) | HTMLElement;
    parentNode?: string | HTMLElement;
    styles?: string;
    oncreate?: (self: DOMElement, info?: DOMElementInfo) => void;
    onresize?: (self: DOMElement, info?: DOMElementInfo) => void;
    ondelete?: (self: DOMElement, info?: DOMElementInfo) => void;
    onchanged?: (props: any) => void;
    renderonchanged?: boolean | ((self: DOMElement, info: DOMElementInfo) => void);
    props?: {
        [key: string]: any;
    };
    innerText?: string;
    innerHTML?: string;
    id?: string;
} & GraphNodeProperties;
