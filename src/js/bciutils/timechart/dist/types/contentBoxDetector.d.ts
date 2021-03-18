import { ResolvedRenderOptions } from './options';
import { RenderModel } from './renderModel';
export declare class ContentBoxDetector {
    static meta: {
        name: string;
        required: string[];
        optional: string[];
    };
    node: HTMLElement;
    constructor(el: HTMLElement, model: RenderModel, options: ResolvedRenderOptions);
}
