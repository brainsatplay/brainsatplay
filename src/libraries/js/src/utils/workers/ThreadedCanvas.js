import { WorkerManager } from "./Workers"

//The animation should probably be an arrow function
export class ThreadedCanvas {
    constructor(canvas, context='2d', animation=undefined) { 
        if(!canvas) throw new Error('Input a canvas element or Id')
        this.name = `canvas_${Math.round(Math.random()*100000)}`;
        this.workerId = undefined;
        
        if(typeof canvas === 'string') canvas = document.getElementById(canvas);
        this.canvas = canvas;
        this.context = context;

        if(animation) {
            this.init();
            this.setAnimation(animation);
        }
        
    }

    setContext(context=this.context){
        this.context = context;
        window.workers.postToWorker({context:context, origin:this.name},this.workerId);
    }

    setCanvas(canvas=this.canvas) {
        this.canvas = canvas;
        let offscreen = canvas.transferControlToOffscreen();
        window.workers.postToWorker({canvas: offscreen, origin:this.name},this.workerId,[offscreen]);
    }

    //you can reference canvas/this.canvas and context/this.context in the function 
    //Set values then reference this.x etc as well, to have controllable values
    setAnimation(animationFunction) {
        if(typeof animationFunction !== 'function') return false;
        let fstring = animationFunction.toString();
        window.workers.postToWorker({origin:this.name,foo:'setAnimation',args:[fstring]},this.workerId)
    }

    setValues(values={}) {
        if(typeof values === 'object') {
            window.workers.postToWorker({origin:this.name,foo:'setValues',args:values},this.workerId);
        }
    }

    stopAnimation() {
        window.workers.postToWorker({origin:this.name,foo:'stopAnimation'},this.workerId)
    }

    setCanvasSize(w=this.canvas.width,h=this.canvas.height) {
        window.workers.postToWorker({origin:this.name,foo:'resizecanvas',args:[w,h]},this.workerId);
    }

    init() {
        if(!this.workerId) {
            if (window.workers == null){
                window.workers = new WorkerManager()
            }

            this.workerId = window.workers.addWorker(); // add a worker for this DataAtlas analyzer instance
            window.workers.workerResponses.push(this.workeronmessage);
        }
        this.setCanvas();
        this.setContext();
    }

    deinit() {
        window.workers.terminate(this.workerId);
    }

    workeronmessage = (msg) => {
        if(msg.origin === this.name) { 
            console.log("Result: ", msg);
        }
    }

    test() {
        let canvas = document.getElementById('testcanvas')
        if(!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'testcanvas';
            document.body.insertAdjacentElement('beforeend',canvas);
        }
        this.canvas = canvas;
        this.context = '2d';

        this.init();

        this.setValues({x:1,y:2,z:3});

        function drawFunc() {
            if(!this.x) {
                this.x = 1;
                this.y = 2;
                this.z = 3;
            }
            this.context.font = '10px serif';
            this.context.fillText(`${this.x} + ${this.y} + ${this.z} = ${this.x+this.y+this.z}`,10,50);
        
            this.x++;
            this.z+=2;
        }

        this.setAnimation(drawFunc);

        setTimeout(()=>{this.stopAnimation();},10000);

    }
}