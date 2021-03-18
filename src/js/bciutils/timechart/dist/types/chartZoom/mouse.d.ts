import { CapableElement, ResolvedOptions } from './options';
import { EventDispatcher } from '../utils';
export declare class ChartZoomMouse {
    private el;
    private options;
    scaleUpdated: EventDispatcher<() => void>;
    private previousPoint;
    constructor(el: CapableElement, options: ResolvedOptions);
    private point;
    private onMouseMove;
    private onMouseDown;
    private onMouseUp;
}
