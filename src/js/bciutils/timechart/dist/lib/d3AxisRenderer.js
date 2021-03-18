import { select } from "d3-selection";
import { axisBottom, axisLeft } from 'd3-axis';
export class D3AxisRenderer {
    constructor(model, svg, options) {
        this.model = model;
        this.options = options;
        this.xAxis = axisBottom(this.model.xScale);
        this.yAxis = axisLeft(this.model.yScale);
        const d3Svg = select(svg);
        this.xg = d3Svg.append('g');
        this.yg = d3Svg.append('g');
        model.updated.on(() => this.update());
        model.resized.on((w, h) => this.onResize(w, h));
    }
    update() {
        const xs = this.model.xScale;
        const xts = this.options.xScaleType()
            .domain(xs.domain().map(d => d + this.options.baseTime))
            .range(xs.range());
        this.xAxis.scale(xts);
        this.xg.call(this.xAxis);
        this.yAxis.scale(this.model.yScale);
        this.yg.call(this.yAxis);
    }
    onResize(width, height) {
        const op = this.options;
        this.xg.attr('transform', `translate(0, ${height - op.paddingBottom})`);
        this.yg.attr('transform', `translate(${op.paddingLeft}, 0)`);
        this.update();
    }
}
//# sourceMappingURL=d3AxisRenderer.js.map