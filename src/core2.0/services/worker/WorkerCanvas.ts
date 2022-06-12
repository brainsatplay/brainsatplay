//provide routes for applying canvases to workers

import { parseFunctionFromText } from "../../Graph";

//load on front and backend
export const workerCanvasRoutes = {
    transferCanvas:(canvas:any, worker:Worker|MessagePort, context?:string, drawfn?:string|((canvas:any,context:any)=>void)) => {
        let _id = `canvas${Math.floor(Math.random()*1000000000000000)}`;
        let offscreen = canvas.transferControlToOffscreen();

        let message:any = {route:'receiveCanvas',args:{offscreen,_id,context}};

        if(drawfn) {
            if(typeof drawfn === 'function') drawfn = drawfn.toString();
            message.animation = drawfn;
        }

        worker.postMessage(message,[offscreen]);
    
        return _id;
    },
    receiveCanvas:(self, origin, options:{offscreen:any,_id:string,context:string,animation?:string|((canvas:any,context:any)=>void)}) => {
        if(!self.graph.CANVASES) self.graph.CANVASES = {};

        self.graph.CANVASES[options._id] = {
            _id:options._id, 
            canvas:options.offscreen, 
            context:options.offscreen.getContext(options.context), 
            animation:options.animation, 
            animating:false
        };
        
        if(typeof self.graph.CANVASES[options._id].animation === 'string') {
            self.graph.CANVASES[options._id].animation = parseFunctionFromText(self.graph.CANVASES[options._id].animation);
        }
        if(typeof self.graph.CANVASES[options._id].animation === 'function') {
            let draw = (canvas,context) => {            
                if(self.graph.CANVASES[options._id].animating)
                    requestAnimationFrame(()=>{ (self.graph.CANVASES[options._id].animation as any)(canvas,context);  })
            }

            draw(self.graph.CANVASES[options._id].canvas,self.graph.CANVASES[options._id].context);
        }
   

        return self.graph.CANVASES[options._id];
    },
    setDraw:(self, origin, _id:string, drawfn:string|((canvas:any,context:any)=>void))=>{
        let canvasopts = self.graph.CANVASES[_id];
        if(canvasopts) {
            if(typeof drawfn === 'string') drawfn = parseFunctionFromText(drawfn);
            if(typeof drawfn === 'function') {
                canvasopts.animation = drawfn;
            }
            return true;
        }
        return false;
    },
    animate:(self, origin, _id, drawfn?:string|((canvas:any,context:any)=>void))=>{ //run the draw function applied to the animation or provide a new one
        let canvasopts = self.graph.CANVASES[_id];

        if(canvasopts && drawfn) {
            if(typeof drawfn === 'string') drawfn = parseFunctionFromText(drawfn);
            if(typeof drawfn === 'function') {
                canvasopts.animation = drawfn;
            }
        }

        if(typeof canvasopts?.animation === 'function' && !canvasopts?.animating) {
            let draw = (canvas,context) => {            
                if(canvasopts.animating)
                    requestAnimationFrame(()=>{ (canvasopts.animation as any)(canvas,context);  })
            }

            draw(canvasopts.canvas,self.graph.CANVASES[canvasopts._id].context);
            return true;
        }
        return false;
    },
    stopAnim:(self,origin,_id)=>{
        let canvasopts = self.graph.CANVASES[_id];
        if(canvasopts) canvasopts.animating = false;
        return true;
    }
}

//todo: threejs and easy draw loop macros