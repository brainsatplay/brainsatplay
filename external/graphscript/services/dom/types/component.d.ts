import { DOMElement } from "../DOMElement";
import { Graph, GraphNode, GraphNodeProperties } from "../../../Graph";
import { ElementProps } from "./element";
import { CanvasElementProps } from "./canvascomponent";
export declare type DOMElementProps = GraphNodeProperties & {
    tagName?: string;
    template?: string | ((self: DOMElement, props: any) => string | HTMLElement) | HTMLElement;
    parentNode?: string | HTMLElement;
    styles?: string;
    onrender?: (self: DOMElement, info?: DOMElementInfo) => void;
    onresize?: (self: DOMElement, info?: DOMElementInfo) => void;
    ondelete?: (self: DOMElement, info?: DOMElementInfo) => void;
    onchanged?: (props: any) => void;
    renderonchanged?: boolean | ((self: DOMElement, info: DOMElementInfo) => void);
    innerText?: string;
    innerHTML?: string;
    id?: string;
    children?: {
        [key: string]: string | boolean | undefined | GraphNodeProperties | GraphNode | Graph | DOMElementProps | ElementProps | CanvasElementProps;
    };
    generateChildElementNodes?: boolean;
};
export declare type DOMElementInfo = {
    element: DOMElement;
    class: any;
    node: GraphNode;
    divs: any[];
} & DOMElementProps;
export declare type ComponentOptions = GraphNodeProperties & {
    tagName?: string;
    template?: string | ((self: DOMElement, props: any) => string | HTMLElement) | HTMLElement;
    parentNode?: string | HTMLElement;
    styles?: string;
    useShadow?: boolean;
    onrender?: (self: DOMElement, info?: DOMElementInfo) => void;
    onresize?: (self: DOMElement, info?: DOMElementInfo) => void;
    onremove?: (self: DOMElement, info?: DOMElementInfo) => void;
    onchanged?: (props: any) => void;
    renderonchanged?: boolean | ((self: DOMElement, info: DOMElementInfo) => void);
    props?: {
        [key: string]: any;
    };
    innerText?: string;
    innerHTML?: string;
    children?: {
        [key: string]: string | boolean | undefined | GraphNodeProperties | GraphNode | Graph | DOMElementProps | ElementProps | CanvasElementProps;
    };
    id?: string;
};
