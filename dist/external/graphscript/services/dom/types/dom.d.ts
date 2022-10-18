import { DOMElement } from "../DOMElement";
import { GraphNode, GraphNodeProperties } from "../../../Graph";
export declare type DOMElementProps = {
    tagName?: string;
    template?: string | ((props: any) => string);
    parentNode?: string | HTMLElement;
    styles?: string;
    oncreate?: (props: any, self: DOMElement) => void;
    onresize?: (props: any, self: DOMElement) => void;
    ondelete?: (props: any, self: DOMElement) => void;
    onchanged?: (props: any, self: DOMElement) => void;
    renderonchanged?: boolean | ((props: any, self: DOMElement) => void);
    id?: string;
};
export declare type DOMElementInfo = {
    element: DOMElement;
    class: any;
    node: GraphNode;
    divs: any[];
} & DOMElementProps;
export declare type ComponentOptions = {
    tagName?: string;
    template?: string | ((props: any) => string);
    parentNode?: string | HTMLElement;
    styles?: string;
    oncreate?: (props: any, self: DOMElement) => void;
    onresize?: (props: any, self: DOMElement) => void;
    ondelete?: (props: any, self: DOMElement) => void;
    onchanged?: (props: any, self: DOMElement) => void;
    renderonchanged?: boolean | ((props: any, self: DOMElement) => void);
    props?: {
        [key: string]: any;
    };
    id?: string;
} & GraphNodeProperties;
