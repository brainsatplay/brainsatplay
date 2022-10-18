import { ElementOptions } from './element';
import { ComponentOptions } from './component';
import { CanvasOptions } from './canvascomponent';
export declare type CompleteOptions = {
    parentNode: HTMLElement;
    id: string;
} & (CanvasOptions | ComponentOptions | ElementOptions);
