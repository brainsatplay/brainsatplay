export function addCustomElement(cls: any, tag: any, extend?: any): void;
export function randomId(tag?: string): string;
export function parseFunctionFromText(method: any): any;
export class DOMElement extends HTMLElement {
    static get tag(): string;
    static addElement(tag?: string, cls?: typeof DOMElement, extend?: any): void;
    template: (props: any, self?: DOMElement) => string;
    props: {};
    useShadow: boolean;
    styles: any;
    oncreate: any;
    onresize: any;
    ondelete: any;
    onchanged: any;
    renderonchanged: boolean;
    FRAGMENT: any;
    attachedShadow: boolean;
    obsAttributes: string[];
    get observedAttributes(): string[];
    attributeChangedCallback(name: any, old: any, val: any): void;
    ONRESIZE: (ev: any) => void;
    connectedCallback(): void;
    delete: () => void;
    render: (props?: {}) => void;
    templateResult: string;
    state: {
        pushToState: {};
        data: {};
        triggers: {};
        setState(updateObj: any): {};
        subscribeTrigger(key: any, onchanged?: (res: any) => void): number;
        unsubscribeTrigger(key: any, sub: any): boolean;
        subscribeTriggerOnce(key?: any, onchanged?: (value: any) => void): void;
    };
}
