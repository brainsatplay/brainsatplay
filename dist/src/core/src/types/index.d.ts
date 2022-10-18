import { Router } from "external/graphscript/routers/Router";
export declare type NodeInfo = {
    tag: string;
    offload?: 'websocket';
};
export declare type AnyObj<type> = {
    [x: string]: type;
};
export declare type EdgeInfo = [string, string];
export declare type AppAPI = {
    [x: string]: any;
    ['.brainsatplay']: {
        package?: AnyObj<any>;
        graph: {
            nodes: NodeInfo[];
            edges: EdgeInfo[];
            ports: {
                output: string | AnyObj<string>;
                input: string | AnyObj<string>;
            };
        };
        plugins: AnyObj<string>;
    };
};
export declare type AssertType = 'json' | 'text';
export declare type EditableAppOptions = {
    ignore?: string[];
} & AppOptions;
export declare type AppOptions = {
    name?: string;
    router?: Router;
    debug?: boolean;
};
