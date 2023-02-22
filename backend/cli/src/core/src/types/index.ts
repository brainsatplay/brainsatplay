
export type WASLOptions = any

export type WASLLoadInput = any

export type WASL = any

export type NodeInfo = {
    tag: string,
    offload?: 'websocket'
}

export type AnyObj<type> = {[x:string]: type}

export type EdgeInfo = [string, string]

export type AppAPI = {
    [x:string]: any,
    default: {
        package?: AnyObj<any>
        graph: {
            nodes: NodeInfo[],
            edges: EdgeInfo[],
            ports: {
                output: string | AnyObj<string>,
                input: string | AnyObj<string>
            }
        } 
        plugins:AnyObj<string>
    }
}


export type AssertType = 'json' | 'text'


export type AppOptions =  {
    name?: string, 
    debug?: boolean,
    ignore?: string[], // files to ignore
    save?: string[] // files to always save
    autosync?: string[],
    sameRoot?: number, // depth of match required to consider two remote roots the same (defaul to 4 for GitHub)
    edit?: boolean,
}