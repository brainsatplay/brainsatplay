

export function addCustomElement(cls: any, tag: any, extend?: any): void;
export function randomId(tag?: string): string;
export function parseFunctionFromText(method: any): any;
export class DOMElement extends HTMLElement {
    static get tag(): string;
    static addElement(tag?: string, cls?: typeof DOMElement, extend?: any): void;
    template: ((self: DOMElement, props: any) => (string|HTMLElement)) | string | HTMLElement;
    props: {[key:string]:any};
    useShadow: boolean;
    styles: string;
    oncreate: ((self: DOMElement, props: any) => void);
    onresize: ((self: DOMElement, props: any) => void);
    ondelete: ((self: DOMElement, props: any) => void);
    onchanged: ((self: DOMElement, props: any) => void);
    renderonchanged: boolean | ((self: DOMElement, props: any) => void);
    FRAGMENT: any;
    STYLE: any;
    attachedShadow: boolean;
    obsAttributes: string[];
    get observedAttributes(): string[];
    attributeChangedCallback: (name: any, old: any, val: any) => void;
    ONRESIZE: (ev: any) => void;
    connectedCallback(): void;
    delete: () => void;
    render: (props?: {}) => void;
    templateResult: any;
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
