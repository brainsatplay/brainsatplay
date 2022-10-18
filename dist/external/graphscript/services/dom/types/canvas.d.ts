import { DOMElementInfo, DOMElementProps } from "./dom";
import { DOMElement } from "../DOMElement";
import { GraphNode, GraphNodeProperties } from "../../../Graph";
export declare type CanvasElementProps = {
    draw: ((props: any, self: DOMElement) => string);
    context: '2d' | 'webgl' | 'webgl2' | 'bitmaprenderer' | 'experimental-webgl' | 'xrpresent';
    width?: string;
    height?: string;
    style?: string;
} & DOMElementInfo;
export declare type CanvasElementInfo = {
    element: DOMElement & {
        canvas: HTMLCanvasElement;
        context: RenderingContext;
    };
    draw: ((props: any, self: DOMElement) => void);
    canvas: HTMLCanvasElement;
    context: RenderingContext;
    animating: boolean;
    animation: any;
    width?: string;
    height?: string;
    style?: string;
    class: any;
    node: GraphNode;
} & DOMElementProps;
export declare type CanvasOptions = {
    tagName?: string;
    context: '2d' | 'webgl' | 'webgl2' | 'bitmaprenderer' | 'experimental-webgl' | 'xrpresent';
    draw: ((props: any, self: DOMElement) => void);
    width?: string;
    height?: string;
    style?: CSSStyleDeclaration;
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
