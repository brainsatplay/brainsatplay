import { Selection } from "d3-selection";
import { ResolvedRenderOptions } from "./options";
import { RenderModel } from './renderModel';
export declare class D3AxisRenderer {
    private model;
    private options;
    xg: Selection<SVGGElement, unknown, null, undefined>;
    yg: Selection<SVGGElement, unknown, null, undefined>;
    xAxis: import("d3-axis").Axis<import("d3-scale").NumberValue>;
    yAxis: import("d3-axis").Axis<import("d3-scale").NumberValue>;
    constructor(model: RenderModel, svg: SVGSVGElement, options: ResolvedRenderOptions);
    update(): void;
    onResize(width: number, height: number): void;
}
