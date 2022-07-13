export type NodeInfo = {
    tag: string,
    offload?: 'websocket'
}

export type AnyObj<type> = {[x:string]: type}

export type EdgeInfo = [string, string]

export type AppAPI = {
    [x:string]: any,
    ['.brainsatplay']: {
        package?: AnyObj<any>
        graph: {
            nodes: NodeInfo[],
            edges: EdgeInfo[],
            ports: {
                output: string,
                input: AnyObj<string>
            }
        } 
        plugins:AnyObj<string>
    }
}


export type AssertType = 'json' | 'text'