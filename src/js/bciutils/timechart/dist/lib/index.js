import { rgb } from 'd3-color';
import { RenderModel } from './renderModel';
import { LineChartRenderer } from './lineChartRenderer';
import { CanvasLayer } from './canvasLayer';
import { SVGLayer } from './svgLayer';
import { ContentBoxDetector } from "./contentBoxDetector";
import { ChartZoom } from './chartZoom';
import { D3AxisRenderer } from './d3AxisRenderer';
import { Legend } from './legend';
import { Crosshair } from './crosshair';
import { NearestPoint, NearestPointModel } from './nearestPoint';
import { scaleTime } from 'd3-scale';
const defaultOptions = {
    pixelRatio: window.devicePixelRatio,
    lineWidth: 1,
    backgroundColor: rgb(0, 0, 0, 0),
    paddingTop: 10,
    paddingRight: 10,
    paddingLeft: 45,
    paddingBottom: 20,
    xRange: 'auto',
    yRange: 'auto',
    realTime: false,
    baseTime: 0,
    xScaleType: scaleTime,
    debugWebGL: false,
    forceWebGL1: false,
};
const defaultSeriesOptions = {
    name: '',
    visible: true,
};
export default class TimeChart {
    constructor(el, options) {
        var _a, _b, _c;
        this.el = el;
        this.disposed = false;
        options = options !== null && options !== void 0 ? options : {};
        const series = (_b = (_a = options.series) === null || _a === void 0 ? void 0 : _a.map(s => this.completeSeriesOptions(s))) !== null && _b !== void 0 ? _b : [];
        const renderOptions = Object.assign(Object.assign(Object.assign({}, defaultOptions), options), { series });
        this.model = new RenderModel(renderOptions);
        const shadowRoot = (_c = el.shadowRoot) !== null && _c !== void 0 ? _c : el.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerText = `
:host {
    contain: size layout paint style;
    position: relative;
}`;
        shadowRoot.appendChild(style);
        const canvasLayer = new CanvasLayer(el, renderOptions, this.model);
        const lineChartRenderer = new LineChartRenderer(this.model, canvasLayer.gl, renderOptions);
        const svgLayer = new SVGLayer(el, this.model);
        const contentBoxDetector = new ContentBoxDetector(el, this.model, renderOptions);
        const axisRenderer = new D3AxisRenderer(this.model, svgLayer.svgNode, renderOptions);
        const legend = new Legend(el, this.model, renderOptions);
        const crosshair = new Crosshair(svgLayer, this.model, renderOptions, contentBoxDetector);
        const nearestPointModel = new NearestPointModel(canvasLayer, this.model, renderOptions, contentBoxDetector);
        const nearestPoint = new NearestPoint(svgLayer, renderOptions, nearestPointModel);
        this.options = Object.assign(renderOptions, {
            zoom: this.registerZoom(contentBoxDetector.node, options.zoom)
        });
        this.onResize();
        const resizeHandler = () => this.onResize();
        window.addEventListener('resize', resizeHandler);
        this.model.disposing.on(() => {
            window.removeEventListener('resize', resizeHandler);
            shadowRoot.removeChild(style);
        });
    }
    completeSeriesOptions(s) {
        return Object.assign(Object.assign(Object.assign(Object.assign({ data: [] }, defaultSeriesOptions), { color: getComputedStyle(this.el).getPropertyValue('color') }), s), { _complete: true });
    }
    registerZoom(el, zoomOptions) {
        if (zoomOptions) {
            const z = new ChartZoom(el, {
                x: zoomOptions.x && Object.assign(Object.assign({}, zoomOptions.x), { scale: this.model.xScale }),
                y: zoomOptions.y && Object.assign(Object.assign({}, zoomOptions.y), { scale: this.model.yScale })
            });
            const resolvedOptions = z.options;
            this.model.updated.on(() => {
                const dirs = [
                    [resolvedOptions.x, this.model.xScale, this.model.xRange],
                    [resolvedOptions.y, this.model.yScale, this.model.yRange],
                ];
                for (const [op, scale, range] of dirs) {
                    if (!(op === null || op === void 0 ? void 0 : op.autoRange)) {
                        continue;
                    }
                    let [min, max] = scale.domain();
                    if (range) {
                        min = Math.min(min, range.min);
                        max = Math.max(max, range.max);
                    }
                    op.minDomain = min;
                    op.maxDomain = max;
                }
                z.update();
            });
            z.onScaleUpdated(() => {
                this.options.xRange = null;
                this.options.yRange = null;
                this.options.realTime = false;
                this.update();
            });
            return resolvedOptions;
        }
    }
    onResize() {
        this.model.resize(this.el.clientWidth, this.el.clientHeight);
    }
    update() {
        if (this.disposed) {
            throw new Error('Cannot update after dispose.');
        }
        // fix dynamic added series
        for (let i = 0; i < this.options.series.length; i++) {
            const s = this.options.series[i];
            if (!s._complete) {
                this.options.series[i] = this.completeSeriesOptions(s);
            }
        }
        this.model.requestRedraw();
    }
    dispose() {
        this.model.dispose();
        this.disposed = true;
    }
}
//# sourceMappingURL=index.js.map