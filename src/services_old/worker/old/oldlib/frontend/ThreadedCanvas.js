
//The animation should probably be an arrow function
export class ThreadedCanvas {
    constructor(manager, canvas, context=undefined, drawFunction=undefined, setValues=undefined, workerId=undefined, origin= `canvas_${Math.round(Math.random()*100000)}`, transfer=undefined) { 
        if(!canvas) throw new Error('Input a canvas element or Id')
        this.origin = origin;
        this.workerId = workerId;
        this.manager = manager;
        if(!manager) return false;
        
        if(typeof canvas === 'string') canvas = document.getElementById(canvas);
        this.canvas = canvas;
        this.context = context;
        this.offscreen;

        if(!this.workerId) this.initWorker();
        
        if(typeof setValues === 'object') this.manager.postToWorker({foo:'setValues',args:setValues,origin:this.origin},this.workerId,transfer);
        if(canvas) {
            this.setCanvas(canvas);
        }
        if(context) { 
            this.setContext(context);
        }
        if(drawFunction) {
            this.setAnimation(drawFunction);
        }
        
    }

    setContext(context=this.context){
        this.context = context;
        this.manager.postToWorker({context:context, origin:this.origin},this.workerId);
    }

    setCanvas(canvas=this.canvas) {
        this.canvas = canvas;
        this.offscreen = canvas.transferControlToOffscreen();
        this.manager.postToWorker({canvas: this.offscreen, origin:this.origin, foo:null},this.workerId,[this.offscreen]);
    }

    // {x:3, y:['a','b','c']} etc
    setValues(valObject=undefined,transfer=undefined) {
        if(typeof setValues === 'object') this.manager.postToWorker({foo:'setValues',input:valObject,origin:this.origin},this.workerId,transfer);
    }

    //you can reference canvas/this.canvas and context/this.context in the function 
    //Set values then reference this.x etc as well, to have controllable values
    setAnimation(animationFunction) {
        let fstring = animationFunction;
        if(typeof animationFunction === 'function') fstring = animationFunction.toString();
        else if(typeof animationFunction !== 'string') return false;
        //console.log(fstring)
        this.manager.postToWorker({origin:this.origin,foo:'setAnimation',input:[fstring]},this.workerId)
    }

    addSetup(setupFunction) {
        let fstring = setupFunction
        if(typeof setupFunction === 'function') fstring = setupFunction.toString();
        this.manager.postToWorker({origin:this.origin,foo:'addFunc',input:['setupAnim',fstring]},this.workerId)
    }

    setThreeAnimation(setupFunction, drawFunction) {
        this.manager.postToWorker({origin:this.origin,foo:'initThree',input:[setupFunction.toString(),drawFunction.toString()]})
    }

    startThreeAnimation() {
        this.manager.postToWorker({origin:this.origin,foo:'startThree',input:[]},this.workerId);
    }

    clearThreeAnimation() {
        this.manager.postToWorker({origin:this.origin,foo:'clearThree',input:[]},this.workerId);
    }

    setValues(values={},transfer=[]) {
        if(typeof values === 'object') {
            this.manager.postToWorker({origin:this.origin,foo:'setValues',input:values},this.workerId,transfer);
        }
    }

    startAnimation() {
        this.manager.postToWorker({origin:this.origin,foo:'startAnimation',input:[]},this.workerId);
    }

    stopAnimation() {
        this.manager.postToWorker({origin:this.origin,foo:'stopAnimation',input:[]},this.workerId);
    }

    setCanvasSize(w=this.canvas.width,h=this.canvas.height) {
        this.manager.postToWorker({origin:this.origin,foo:'resizecanvas',input:[w,h]},this.workerId);
    }

    initWorker() {
        if(!this.workerId && this.manager) {
            this.workerId = this.manager.addWorker(); // add a worker for this DataAtlas analyzer instance
            this.manager.workerResponses.push(this.workeronmessage);
        }
        this.setCanvas();
        this.setContext();
    }

    init(drawFunction) {
        if(!this.workerId) this.initWorker();
        this.setCanvas();
        this.setContext();
        if(drawFunction) this.setAnimation(drawFunction);
    }

    deinit() {
        this.manager.terminate(this.workerId);
    }

    workeronmessage = (msg) => {
        if(msg.origin === this.origin) { 
            console.log("Result: ", msg);
        }
    }

    test(id='testcanvas') {
        let canvas = document.getElementById(id)
        if(!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = id;
            document.body.insertAdjacentElement('beforeend',canvas);
        }
        this.canvas = canvas;
        this.context = '2d';

        this.init();

        this.setValues({x:1,y:2,z:3});

        function drawFunc(self, args, origin) {
            if(!self.x) {
                self.x = 1;
                self.y = 2;
                self.z = 3;
            }
            self.ctx.font = '10px serif';
            self.ctx.fillText(`${self.x} + ${self.y} + ${self.z} = ${self.x+self.y+self.z}`,10,50);
        
            self.x++;
            self.z+=2;
        }

        this.setAnimation(drawFunc);

        setTimeout(()=>{this.stopAnimation();},10000);

    }
}