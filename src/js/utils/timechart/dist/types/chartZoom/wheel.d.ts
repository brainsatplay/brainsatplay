import { CapableElement, ResolvedOptions } from "./options";
import { EventDispatcher } from '../utils';
export declare class ChartZoomWheel {
    private el;
    private options;
    scaleUpdated: EventDispatcher<() => void>;
    constructor(el: CapableElement, options: ResolvedOptions);
    private onWheel;
}
