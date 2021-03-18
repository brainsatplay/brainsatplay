import { ResolvedOptions, CapableElement } from './options';
import { EventDispatcher } from '../utils';
export declare class ChartZoomTouch {
    private el;
    private options;
    scaleUpdated: EventDispatcher<() => void>;
    private majorDirection;
    private previousPoints;
    private enabled;
    constructor(el: CapableElement, options: ResolvedOptions);
    update(): void;
    private syncEnabled;
    private syncTouchAction;
    private calcKB;
    private touchPoints;
    private dirOptions;
    private onTouchStart;
    private onTouchEnd;
    private onTouchMove;
}
