import * as freerange from 'freerange/dist/index.esm';
import App from "../App";
import { EditableAppOptions } from '../types';
import Plugins from "./Plugins";
export default class EditableApp {
    active: App;
    plugins: Plugins;
    filesystem?: string | freerange.System;
    onstart: any;
    onstop: any;
    ignore: string[];
    debug: boolean;
    options: EditableAppOptions;
    packagePath: string;
    parentNode?: HTMLElement;
    constructor(input: any, options?: {});
    compile: () => Promise<void>;
    join: (...paths: string[]) => string;
    createFilesystem: (input?: any, options?: EditableAppOptions) => Promise<any>;
    setParent: (parentNode: any) => void;
    start: (input?: any) => Promise<boolean>;
    stop: () => Promise<void>;
    save: () => Promise<void>;
}
