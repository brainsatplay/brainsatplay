export declare function getFnParamInfo(fn: any): Map<string, any>;
export declare function getFnParamNames(fn: any): string[];
export declare function parseFunctionFromText(method?: string): any;
export declare type OperatorType = (//can be async
self: GraphNode, //'this' node
origin: string | GraphNode | Graph, //origin node
...args: any) => any | void;
export declare type Tree = {
    [key: string]: //the key becomes the node tag on the graph
    GraphNode | Graph | //for graphs, pass an input object to the operator like so: e.g. to run a node in the graph: node.run({run:[arg1,arg2]})
    GraphNodeProperties | OperatorType | ((...args: any[]) => any | void) | ({
        aliases: string[];
    } & GraphNodeProperties);
};
export declare type GraphNodeProperties = {
    tag?: string;
    operator?: OperatorType | ((...args: any[]) => any | void);
    forward?: boolean;
    backward?: boolean;
    children?: {
        [key: string]: string | boolean | undefined | GraphNodeProperties | GraphNode | Graph;
    };
    parent?: GraphNode | Graph;
    branch?: {
        [label: string]: {
            if: any;
            then: string | ((...operator_result: any[]) => any) | GraphNode;
        };
    };
    tree?: Tree;
    delay?: false | number;
    repeat?: false | number;
    recursive?: false | number;
    frame?: boolean;
    animate?: boolean;
    loop?: false | number;
    animation?: OperatorType;
    looper?: OperatorType;
    oncreate?: (self: GraphNode) => void;
    DEBUGNODE?: boolean;
    [key: string]: any;
};
export declare const state: {
    pushToState: {};
    data: {};
    triggers: {};
    setState(updateObj: {
        [key: string]: any;
    }): {};
    subscribeTrigger(key: string, onchange: (res: any) => void): number;
    unsubscribeTrigger(key: string, sub: number): boolean;
    subscribeTriggerOnce(key: string, onchange: (res: any) => void): void;
};
/**
 * Creates new instance of a GraphNode
 * The methods of this class can be referenced in the operator after setup for more complex functionality
 *
 * ```typescript
 * const graph = new GraphNode({custom: 1, operator: (self, origin, input) => console.log(input, self.custom)});
 * ```
 */
export declare class GraphNode {
    nodes: Map<any, any>;
    arguments: Map<any, any>;
    tag: string;
    parent: GraphNode | Graph;
    children: any;
    graph: Graph;
    state: {
        pushToState: {};
        data: {};
        triggers: {};
        setState(updateObj: {
            [key: string]: any;
        }): {};
        subscribeTrigger(key: string, onchange: (res: any) => void): number;
        unsubscribeTrigger(key: string, sub: number): boolean;
        subscribeTriggerOnce(key: string, onchange: (res: any) => void): void;
    };
    isLooping: boolean;
    isAnimating: boolean;
    looper: any;
    animation: any;
    forward: boolean;
    backward: boolean;
    runSync: boolean;
    firstRun: boolean;
    DEBUGNODE: boolean;
    source: Graph | GraphNode;
    tree: Tree;
    [key: string]: any;
    constructor(properties?: GraphNodeProperties | Graph | OperatorType | ((...args: any[]) => any | void), parentNode?: GraphNode | Graph, graph?: Graph);
    operator: OperatorType;
    runOp: (node?: GraphNode, origin?: string | GraphNode | Graph, ...args: any[]) => any;
    setOperator: (operator: OperatorType) => OperatorType;
    /**
     * Runs the graph and passes output to connected graphs
     *
     * ```typescript
     * const res = await graph.run(arg1, arg2, arg3);
     * ```
     */
    run: (...args: any[]) => any;
    runAsync: (...args: any[]) => Promise<unknown>;
    transformArgs: (args: any[], self?: GraphNode) => any[];
    _run: (node?: GraphNode, origin?: string | GraphNode | Graph, ...args: any[]) => any;
    runParent: (node: GraphNode, ...args: any[]) => Promise<void>;
    runChildren: (node: GraphNode, ...args: any[]) => Promise<void>;
    runBranch: (node: GraphNode, output: any) => Promise<void>;
    runAnimation: (animation?: OperatorType, args?: any[], node?: (GraphNode & GraphNodeProperties) | any, origin?: string | GraphNode | Graph) => void;
    runLoop: (loop?: OperatorType, args?: any[], node?: (GraphNode & GraphNodeProperties) | any, origin?: string | GraphNode | Graph, timeout?: number) => void;
    setParent: (parent: GraphNode) => void;
    setChildren: (children: GraphNode | GraphNode[]) => void;
    add: (node?: GraphNodeProperties | OperatorType | ((...args: any[]) => any | void)) => GraphNode | GraphNodeProperties;
    remove: (node: string | GraphNode) => void;
    append: (node: string | GraphNode, parentNode?: this) => void;
    subscribe: (callback: GraphNode | ((res: any) => void), tag?: string) => number;
    unsubscribe: (sub: number, tag?: string) => void;
    addChildren: (children: {
        [key: string]: string | boolean | GraphNode | Graph | GraphNodeProperties;
    }) => void;
    callParent: (...args: any[]) => any;
    callChildren: (idx?: number, ...args: any[]) => any;
    setProps: (props?: GraphNodeProperties) => void;
    removeTree: (node: GraphNode | string) => void;
    checkNodesHaveChildMapped: (node: GraphNode | Graph, child: GraphNode, checked?: {}) => void;
    convertChildrenToNodes: (n?: GraphNode) => any;
    stopLooping: (node?: GraphNode) => void;
    stopAnimating: (node?: GraphNode) => void;
    stopNode: (node?: GraphNode) => void;
    subscribeNode: (node: GraphNode) => number;
    print: (node?: string | GraphNode, printChildren?: boolean, nodesPrinted?: any[]) => any;
    reconstruct: (json: string | {
        [x: string]: any;
    }) => GraphNode | GraphNodeProperties;
    setState: (updateObj: {
        [key: string]: any;
    }) => {};
    DEBUGNODES: (debugging?: boolean) => void;
}
export declare class Graph {
    nNodes: number;
    tag: string;
    nodes: Map<any, any>;
    state: {
        pushToState: {};
        data: {};
        triggers: {};
        setState(updateObj: {
            [key: string]: any;
        }): {};
        subscribeTrigger(key: string, onchange: (res: any) => void): number;
        unsubscribeTrigger(key: string, sub: number): boolean;
        subscribeTriggerOnce(key: string, onchange: (res: any) => void): void;
    };
    tree: Tree;
    [key: string]: any;
    constructor(tree?: Tree, tag?: string, props?: {
        [key: string]: any;
    });
    add: (node?: GraphNode | GraphNodeProperties | OperatorType | ((...args: any[]) => any | void), fromTree?: boolean) => GraphNode | GraphNodeProperties;
    setTree: (tree?: Tree) => void;
    get: (tag: string) => any;
    set: (node: GraphNode) => Map<any, any>;
    run: (node: string | GraphNode, ...args: any[]) => any;
    runAsync: (node: string | GraphNode, ...args: any[]) => Promise<unknown>;
    _run: (node: string | GraphNode, origin?: string | GraphNode | Graph, ...args: any[]) => any;
    removeTree: (node: string | GraphNode) => string | GraphNode;
    remove: (node: string | GraphNode) => string | GraphNode;
    append: (node: GraphNode, parentNode: GraphNode) => void;
    callParent: (node: GraphNode, origin?: string | GraphNode | Graph, ...args: any[]) => Promise<any>;
    callChildren: (node: GraphNode, idx?: number, ...args: any[]) => Promise<any>;
    subscribe: (node: string | GraphNode, callback: (res: any) => void) => number;
    unsubscribe: (tag: string, sub: number) => void;
    subscribeNode: (inputNode: string | GraphNode, outputNode: GraphNode | string) => number;
    stopNode: (node: string | GraphNode) => void;
    print: (node?: GraphNode | undefined, printChildren?: boolean) => any;
    reconstruct: (json: string | {
        [x: string]: any;
    }) => GraphNode | GraphNodeProperties;
    create: (operator: OperatorType, parentNode: GraphNode, props: GraphNodeProperties) => GraphNode;
    setState: (updateObj: {
        [key: string]: any;
    }) => {};
    DEBUGNODES: (debugging?: boolean) => void;
}
export declare function reconstructNode(json: string | {
    [x: string]: any;
}, parentNode: any, graph: any): GraphNode;
export declare function reconstructObject(json?: string | {
    [x: string]: any;
}): any;
export declare const stringifyWithCircularRefs: (obj: any, space?: any) => string;
export declare const stringifyFast: (obj: any, space?: any) => string;
export declare function createNode(operator: OperatorType, parentNode: GraphNode, props: GraphNodeProperties, graph: Graph): GraphNode;
