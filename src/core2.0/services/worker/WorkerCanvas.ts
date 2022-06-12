//provide routes for applying canvases to workers

export const workerCanvasRoutes = {
    transferCanvas:(canvas:any,worker:Worker|MessagePort,context?:string) => {
        let id = `canvas${Math.floor(Math.random()*1000000000000000)}`;
        let offscreen = canvas.transferControlToOffscreen()
        worker.postMessage({route:'transferCanvas',args:{offscreen,id,context}},[offscreen]);
    
        return id;
    },
    receiveCanvas:(self,origin,options:{offscreen:any,id:string,context:string}) => {
        if(!self.graph.CANVASES) self.graph.CANVASES = {};
    
        self.graph.CANVASES[options.id] = {canvas:options.offscreen, context:options.offscreen.getContext(options.context)};
    
        return self.graph.CANVASES[options.id];
    }
    
}

//todo: threejs and easy draw loop macros