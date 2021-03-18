import { RenderModel } from './renderModel';
import { ResolvedRenderOptions } from './options';
import { SVGLayer } from './svgLayer';
import { ContentBoxDetector } from "./contentBoxDetector";
export declare class Crosshair {
    static meta: {
        name: string;
        required: string[];
    };
    constructor(svg: SVGLayer, model: RenderModel, options: ResolvedRenderOptions, detector: ContentBoxDetector);
}
