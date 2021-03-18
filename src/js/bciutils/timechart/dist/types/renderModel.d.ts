import { ResolvedRenderOptions } from './options';
import { EventDispatcher } from './utils';
export interface DataPoint {
    x: number;
    y: number;
}
interface MinMax {
    min: number;
    max: number;
}
export declare class RenderModel {
    private options;
    xScale: import("d3-scale").ScaleLinear<number, number>;
    yScale: import("d3-scale").ScaleLinear<number, number>;
    xRange: MinMax | null;
    yRange: MinMax | null;
    private seriesInfo;
    constructor(options: ResolvedRenderOptions);
    resized: EventDispatcher<(width: number, height: number) => void>;
    resize(width: number, height: number): void;
    updated: EventDispatcher<() => void>;
    disposing: EventDispatcher<() => void>;
    private disposed;
    dispose(): void;
    update(): void;
    updateModel(): void;
    private redrawRequested;
    requestRedraw(): void;
    pxPoint(dataPoint: DataPoint): {
        x: number;
        y: number;
    };
}
export {};
