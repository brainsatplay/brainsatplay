import { domainSearch, EventDispatcher } from './utils';
export class NearestPointModel {
    constructor(canvas, model, options, detector) {
        this.canvas = canvas;
        this.model = model;
        this.options = options;
        this.points = new Map();
        this.lastX = null;
        this.updated = new EventDispatcher();
        detector.node.addEventListener('mousemove', ev => {
            const rect = canvas.canvas.getBoundingClientRect();
            this.lastX = ev.clientX - rect.left;
            this.adjustPoints();
        });
        detector.node.addEventListener('mouseleave', ev => {
            this.lastX = null;
            this.adjustPoints();
        });
        model.updated.on(() => this.adjustPoints());
    }
    adjustPoints() {
        if (this.lastX === null) {
            this.points.clear();
        }
        else {
            const domain = this.model.xScale.invert(this.lastX);
            for (const s of this.options.series) {
                if (s.data.length == 0 || !s.visible) {
                    this.points.delete(s);
                    continue;
                }
                const pos = domainSearch(s.data, 0, s.data.length, domain, d => d.x);
                const near = [];
                if (pos > 0) {
                    near.push(s.data[pos - 1]);
                }
                if (pos < s.data.length) {
                    near.push(s.data[pos]);
                }
                const sortKey = (a) => Math.abs(a.x - domain);
                near.sort((a, b) => sortKey(a) - sortKey(b));
                const pxPoint = this.model.pxPoint(near[0]);
                const width = this.canvas.canvas.clientWidth;
                const height = this.canvas.canvas.clientHeight;
                if (pxPoint.x <= width && pxPoint.x >= 0 &&
                    pxPoint.y <= height && pxPoint.y >= 0) {
                    this.points.set(s, pxPoint);
                }
                else {
                    this.points.delete(s);
                }
            }
        }
        this.updated.dispatch();
    }
}
NearestPointModel.meta = {
    name: 'nearestPointModel',
    required: ['canvasLayer', 'model', 'options', 'contentBoxDetector']
};
export class NearestPoint {
    constructor(svg, options, pModel) {
        this.svg = svg;
        this.options = options;
        this.pModel = pModel;
        this.intersectPoints = new Map();
        const initTrans = svg.svgNode.createSVGTransform();
        initTrans.setTranslate(0, 0);
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
.timechart-crosshair-intersect {
    fill: var(--background-overlay, white);
    visibility: hidden;
}
.timechart-crosshair-intersect circle {
    r: 3px;
}`;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('timechart-crosshair-intersect');
        g.appendChild(style);
        this.container = g;
        this.adjustIntersectPoints();
        svg.svgNode.appendChild(g);
        pModel.updated.on(() => this.adjustIntersectPoints());
    }
    adjustIntersectPoints() {
        var _a;
        const initTrans = this.svg.svgNode.createSVGTransform();
        initTrans.setTranslate(0, 0);
        for (const s of this.options.series) {
            if (!this.intersectPoints.has(s)) {
                const intersect = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                intersect.style.stroke = s.color.toString();
                intersect.style.strokeWidth = `${(_a = s.lineWidth) !== null && _a !== void 0 ? _a : this.options.lineWidth}px`;
                intersect.transform.baseVal.initialize(initTrans);
                this.container.appendChild(intersect);
                this.intersectPoints.set(s, intersect);
            }
            const intersect = this.intersectPoints.get(s);
            const point = this.pModel.points.get(s);
            if (!point) {
                intersect.style.visibility = 'hidden';
            }
            else {
                intersect.style.visibility = 'visible';
                intersect.transform.baseVal.getItem(0).setTranslate(point.x, point.y);
            }
        }
    }
}
NearestPoint.meta = {
    name: 'nearestPoint',
    required: ['svgLayer', 'options', 'nearestPointModel']
};
//# sourceMappingURL=nearestPoint.js.map