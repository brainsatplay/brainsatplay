import { WorkerManager } from "./Workers"

export class ThreadedCanvas {
    constructor(canvas, context='2d') {
        if(!canvas) throw new Error('Input a canvas element or Id')
        this.name = `canvas_${Math.round(Math.random()*100000)}`;
        this.workerId = undefined;
        
        if(typeof canvas === 'string') canvas = document.getElementById(canvas);
        this.canvas = canvas;
        this.context = context;
        this.offscreen = canvas.transferControlToOffscreen();
        
    }

    setContext(context='2d'){
        this.context = context;
        window.workers.postToWorker({context:context, origin:this.name},this.workerId);
    }

    setCanvas(canvas=this.canvas) {
        this.canvas = canvas;
        this.offscreen = canvas.transferControlToOffscreen();
        window.workers.postToWorker({canvas:this.offscreen, origin:this.name},this.workerId,[this.offscreen]);
    }

    //you can reference canvas/this.canvas and context/this.context in the function 
    setAnimation(animationFunction) {
        if(typeof animationFunction !== 'function') return false;
        let fstring = animationFunction.toString();
        window.workers.postToWorker({origin:this.name,foo:'setAnimation',args:[fstring]},this.workerId)
    }

    stopAnimation() {
        window.workers.postToWorker({origin:this.name,foo:'stopAnimation'},this.workerId)
    }

    setCanvasSize(w=this.canvas.width,h=this.canvas.height) {
        window.workers.postToWorker({origin:this.name,foo:'resizecanvas',args:[w,h]},this.workerId);
    }

    init() {
		if (window.workers == null){
			window.workers = new WorkerManager()
		}

		this.workerId = window.workers.addWorker(); // add a worker for this DataAtlas analyzer instance
		window.workers.workerResponses.push(this.workeronmessage);

        this.setCanvas()
    }

    deinit() {
        window.workers.terminate(this.workerId);
    }

    workeronmessage = (msg) => {
        if(msg.origin === this.name) { 
            console.log("Result: ", msg);
        }
    }
}