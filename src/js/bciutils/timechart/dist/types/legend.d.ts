import { ResolvedRenderOptions, TimeChartSeriesOptions } from "./options";
import { RenderModel } from './renderModel';
export declare class Legend {
    private el;
    private model;
    private options;
    legend: HTMLElement;
    items: Map<TimeChartSeriesOptions, {
        item: HTMLElement;
        example: HTMLElement;
    }>;
    itemContainer: Node;
    constructor(el: HTMLElement, model: RenderModel, options: ResolvedRenderOptions);
    update(): void;
}
