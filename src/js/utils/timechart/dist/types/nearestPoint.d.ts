import { SVGLayer } from './svgLayer';
import { ContentBoxDetector } from "./contentBoxDetector";
import { RenderModel } from './renderModel';
import { ResolvedRenderOptions, TimeChartSeriesOptions } from './options';
import { EventDispatcher } from './utils';
import { CanvasLayer } from './canvasLayer';
export declare class NearestPointModel {
    private canvas;
    private model;
    private options;
    static meta: {
        name: string;
        required: string[];
    };
    points: Map<TimeChartSeriesOptions, {
        x: number;
        y: number;
    }>;
    private lastX;
    updated: EventDispatcher<() => void>;
    constructor(canvas: CanvasLayer, model: RenderModel, options: ResolvedRenderOptions, detector: ContentBoxDetector);
    adjustPoints(): void;
}
export declare class NearestPoint {
    private svg;
    private options;
    private pModel;
    static meta: {
        name: string;
        required: string[];
    };
    private intersectPoints;
    private container;
    constructor(svg: SVGLayer, options: ResolvedRenderOptions, pModel: NearestPointModel);
    adjustIntersectPoints(): void;
}
