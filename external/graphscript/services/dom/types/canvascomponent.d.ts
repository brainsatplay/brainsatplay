import { DOMElementProps } from "./component";
import { DOMElement } from "../DOMElement";
import { Graph, GraphNode, GraphNodeProperties } from "../../../Graph";
import { ElementProps } from "./element";
export declare type CanvasElementProps = GraphNodeProperties & {
    tagName?: string;
    parentNode?: string | HTMLElement;
    styles?: string;
    onchanged?: (props: any) => void;
    id?: string;
    canvas?: HTMLCanvasElement;
    context: '2d' | 'webgl' | 'webgl2' | 'bitmaprenderer' | 'experimental-webgl' | 'xrpresent' | RenderingContext;
    draw: ((self: DOMElement, info: CanvasElementInfo) => void);
    width?: string;
    height?: string;
    onrender?: (self: DOMElement, info?: CanvasElementInfo) => void;
    onresize?: (self: DOMElement, info?: CanvasElementInfo) => void;
    onremove?: (self: DOMElement, info?: CanvasElementInfo) => void;
    renderonchanged?: boolean | ((self: DOMElement, info?: CanvasElementInfo) => void);
    children?: {
        [key: string]: string | boolean | undefined | GraphNodeProperties | GraphNode | Graph | DOMElementProps | ElementProps | CanvasElementProps;
    };
};
export declare type CanvasElementInfo = {
    element: DOMElement & {
        canvas: HTMLCanvasElement;
        context: RenderingContext;
    };
    draw: ((self: DOMElement, info: CanvasElementInfo) => void);
    canvas: HTMLCanvasElement;
    context: RenderingContext;
    animating: boolean;
    animation: any;
    width?: string;
    height?: string;
    style?: string;
    class: any;
    node: GraphNode;
} & CanvasElementProps;
export declare type CanvasOptions = {
    element: DOMElement & {
        canvas: HTMLCanvasElement;
        context: RenderingContext;
    } | HTMLElement;
    tagName?: string;
    canvas?: HTMLCanvasElement;
    context: '2d' | 'webgl' | 'webgl2' | 'bitmaprenderer' | 'experimental-webgl' | 'xrpresent' | RenderingContext;
    draw: ((self: DOMElement, info: CanvasElementInfo) => void);
    width?: string;
    height?: string;
    style?: Partial<CSSStyleDeclaration>;
    parentNode?: string | HTMLElement;
    styles?: string;
    onrender?: (self: DOMElement, info?: CanvasElementInfo) => void;
    onresize?: (self: DOMElement, info?: CanvasElementInfo) => void;
    onremove?: (self: DOMElement, info?: CanvasElementInfo) => void;
    onchanged?: (props: any) => void;
    renderonchanged?: boolean | ((self: DOMElement, info?: CanvasElementInfo) => void);
    props?: {
        [key: string]: any;
    };
    children?: {
        [key: string]: string | boolean | undefined | GraphNodeProperties | GraphNode | Graph | DOMElementProps | ElementProps | CanvasElementProps;
    };
    id?: string;
} & GraphNodeProperties;
