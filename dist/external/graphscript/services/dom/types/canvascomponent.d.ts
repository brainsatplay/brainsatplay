import { DOMElement } from "../DOMElement";
import { GraphNode, GraphNodeProperties } from "../../../Graph";
export declare type CanvasElementProps = {
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
    oncreate?: (self: DOMElement, info?: CanvasElementInfo) => void;
    onresize?: (self: DOMElement, info?: CanvasElementInfo) => void;
    ondelete?: (self: DOMElement, info?: CanvasElementInfo) => void;
    renderonchanged?: boolean | ((self: DOMElement, info?: CanvasElementInfo) => void);
} & GraphNodeProperties;
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
    style?: CSSStyleDeclaration;
    parentNode?: string | HTMLElement;
    styles?: string;
    oncreate?: (self: DOMElement, info?: CanvasElementInfo) => void;
    onresize?: (self: DOMElement, info?: CanvasElementInfo) => void;
    ondelete?: (self: DOMElement, info?: CanvasElementInfo) => void;
    onchanged?: (props: any) => void;
    renderonchanged?: boolean | ((self: DOMElement, info?: CanvasElementInfo) => void);
    props?: {
        [key: string]: any;
    };
    id?: string;
} & GraphNodeProperties;
