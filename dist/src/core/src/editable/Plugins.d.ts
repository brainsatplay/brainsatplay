import * as freerange from 'freerange/dist/index.esm';
export default class Plugins {
    readyState: boolean;
    source: string;
    filesystem: freerange.System;
    ['#plugins']: {
        [x: string]: {
            path: string;
            metadata?: freerange.RangeFile;
            module?: freerange.RangeFile;
            package?: freerange.RangeFile;
            graph?: freerange.RangeFile;
            plugins?: freerange.RangeFile;
        };
    };
    checkedPackageLocations: {};
    list: Set<string>;
    base: string;
    suffixes: {
        metadata: string;
        graph: string;
        plugins: string;
    };
    regexp: {
        metadata: RegExp;
        graph: RegExp;
        plugins: RegExp;
    };
    constructor(source?: string | freerange.System);
    init: () => Promise<void>;
    set: (f: any) => void;
    getFile: (url: any) => Promise<any>;
    package: (name: any) => Promise<any>;
    get: (name: any, type?: string) => any;
    metadata: (name: any) => any;
    plugins: (name: any) => Promise<any>;
    graph: (name: any) => Promise<any>;
    getPath: (name: string) => any;
    path: (path: any, type?: string) => any;
    module: (name: any) => any;
}
