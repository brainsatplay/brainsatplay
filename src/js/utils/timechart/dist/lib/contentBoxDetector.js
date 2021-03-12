export class ContentBoxDetector {
    constructor(el, model, options) {
        this.node = document.createElement('div');
        this.node.style.position = 'absolute';
        this.node.style.left = `${options.paddingLeft}px`;
        this.node.style.right = `${options.paddingRight}px`;
        this.node.style.top = `${options.paddingTop}px`;
        this.node.style.bottom = `${options.paddingBottom}px`;
        el.shadowRoot.appendChild(this.node);
        model.disposing.on(() => {
            el.shadowRoot.removeChild(this.node);
        });
    }
}
ContentBoxDetector.meta = {
    name: 'contentBoxDetector',
    required: ['wrapper', 'options'],
    optional: ['svgLayer', 'canvasLayer'],
};
//# sourceMappingURL=contentBoxDetector.js.map