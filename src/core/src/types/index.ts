export type AppInfo = {
    graph: {
        nodes: string[],
        edges: [string, string][],
        offload?: {
            [x: string]: undefined | 'websocket'
        }
    } 
    plugins: {[x:string]: string | any}
}


export type AssertType = 'json' | 'text'