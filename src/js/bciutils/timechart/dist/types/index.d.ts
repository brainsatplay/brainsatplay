import { TimeChartOptions, ResolvedOptions } from './options';
export default class TimeChart {
    private el;
    options: ResolvedOptions;
    private model;
    private disposed;
    private completeSeriesOptions;
    constructor(el: HTMLElement, options?: TimeChartOptions);
    private registerZoom;
    onResize(): void;
    update(): void;
    dispose(): void;
}
