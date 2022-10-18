import { Graph } from '../../../external/graphscript/Graph';
import { Router } from '../../../external/graphscript/routers/Router';
import { AnyObj, AppAPI, AppOptions } from './types';
declare type InputType = AppAPI;
export default class App {
    name: string;
    package: {
        main: string;
    };
    info: AppAPI;
    remote: boolean;
    packagePath: string;
    graphPath: string;
    ok: boolean;
    parentNode?: HTMLElement;
    plugins: {
        [x: string]: any;
    };
    tree: any;
    router: Router;
    graph: Graph | null;
    nested: {
        [x: string]: App;
    };
    isNested: boolean;
    debug: boolean;
    animated: {
        [key: string]: Graph;
    };
    compile: () => void;
    constructor(input?: InputType, options?: AppOptions);
    checkJSONConversion: (info: any) => any;
    getURL: (str: any) => string | false;
    set: (input?: InputType, name?: string) => void;
    setInfo: (info: InputType) => {
        [x: string]: any;
    };
    setTree: (graph?: {
        nodes: import("./types").NodeInfo[];
        edges: import("./types").EdgeInfo[];
        ports: {
            output: string | AnyObj<string>;
            input: string | AnyObj<string>;
        };
    }) => Promise<any>;
    join: (...paths: string[]) => string;
    getBase: (path: any) => any;
    json: (src: any) => Promise<any>;
    setPackage: (pkg: any) => void;
    init: (input?: InputType) => Promise<boolean>;
    setParent: (parentNode: any) => void;
    start: (input?: InputType) => Promise<boolean>;
    stop: () => void;
    onstart: () => void;
    onstop: () => void;
}
export {};
