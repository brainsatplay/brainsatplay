import {NodeDiv} from '../graph.node'

let component = require('./place.node.html');

// /r/place ripoff
export class PlaceNode extends NodeDiv {
    props={
        colorPicked:'red',
        xSize:128,
        ySize:128,
        xPosition:1, //we'll use absolute positions on the grid independent of canvas size
        yPosition:1,
        xPixelSize:5,
        yPixelSize:5,
        zoom:1,
        data:{},
        canvasClicked: this.canvasClicked, //reference
        //keys:[],
        updated:{}, //indices of updated data
        animation:(node, origin, input)=>{
            //should sync this.props.updated between users right here if doing multiplayer

            //draw loop
            this.draw(node,origin,input);
            for(let i = 0; i < this.drawFuncs.length; i++) { //lets use other nodes to send draw functions to the canvas
                let f = this.drawFuncs[i];
                if(typeof f === 'function') {
                    f(node,origin,input); //pass the args in (need these if you pass arrow functions)
                }
            }
            
        },
        operator:(
            node,
            origin,
            input
        )=>{ 

           // if(cmd === 'update') {
                Object.assign(this.props.data,input);
                //this.props.keys = Object.keys(this.props.data);
           // }

           // if(cmd === 'animate') {

              
                //e.g. input commands
                if(typeof input === 'object') {
                    
                } else if (typeof input === 'number') {
                    
                } else if (typeof input === 'string') {
                    
                } else {
                    
                }
           // }
        },
        forward:true, //pass output to child nodes
        backward:false, //pass output to parent node
        children:undefined, //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
        parent:undefined, //parent graph node
        delay:false, //ms delay to fire the node
        repeat:false, // set repeat as an integer to repeat the input n times
        recursive:false, //or set recursive with an integer to pass the output back in as the next input n times
        animate:true, //true or false
        loop:undefined, //milliseconds or false
        tag:undefined, //generated if not specified, or use to get another node by tag instead of generating a new one
        input:undefined,// can set on the attribute etc
        graph:undefined, //parent AcyclicGraph instance, can set manually or via enclosing acyclic-graph div
        node:undefined, //GraphNode instance, can set manually or as a string to grab a node by tag (or use tag)
    }; //can specify properties of the element which can be subscribed to for changes.

    //set the template string or function (which can input props to return a modified string)
    template=component;

    draw(node,origin,input) {

        //only draws updated pixels

        let canvas = this.props.canvas;
        let ctx = this.props.ctx;

        //xp/yp in canvas coordinates
        let centerX = canvas.width*0.5;
        let centerY = canvas.height*0.5;

        let xPWidth = this.props.xPixelSize*this.props.zoom;
        let yPHeight = this.props.yPixelSize*this.props.zoom;

        //calculate the visible area based on zoom 
        let nPixelsX = Math.ceil(canvas.width/xPWidth); if(nPixelsX > this.props.xSize) nPixelsX = this.props.xSize;
        let nPixelsY = Math.ceil(canvas.height/yPHeight); if(nPixelsY > this.props.ySize) nPixelsY = this.props.ySize;
        
        //first find where we are inside the current pixel based on xP,yP and zoom
        //let gridRelX = this.props.xPosition / this.props.xPixelSize*this.props.xSize; //relative position inside the current pixel (in units)
        //let gridRelY = this.props.yPosition / this.props.yPixelSize*this.props.ySize;

        let currPixelRelX = this.props.xPosition % this.props.xPixelSize;
        let currPixelRelY = this.props.yPosition % this.props.yPixelSize;

        let centerPixelX = Math.floor(this.props.xPosition/this.props.xPixelSize);
        let centerPixelY = Math.floor(this.props.yPosition/this.props.yPixelSize);

        //let curPixelIdx = centerPixelX + this.props.xSize*centerPixelY;
            
        let nPixelsLeft = currPixelRelX;
        while(nPixelsLeft < centerX && nPixelsLeft < xPWidth*this.props.xSize*0.5) {
            nPixelsLeft += xPWidth;
        }
        nPixelsLeft = nPixelsLeft/xPWidth;
        
        let nPixelsUp = currPixelRelY;

        while(nPixelsUp < centerY && nPixelsUp < yPHeight*this.props.ySize*0.5) {
            nPixelsUp += yPHeight;
        }
        nPixelsUp = nPixelsUp/yPHeight;

        let x0 = centerPixelX - Math.floor(nPixelsLeft); // = Math.floor(this.props.xPosition - nPixelsX*0.5);
        let y0 = centerPixelY - Math.floor(nPixelsUp); // = Math.floor(this.props.yPosition - nPixelsY*0.5);

        //ending indices to render against
        let xn = x0+nPixelsX;
        let yn = y0+nPixelsY;

        //now calculate the view window to render rects according to the index colors
        let startingX = centerX - nPixelsLeft*xPWidth;
        let startingY = centerY - nPixelsUp*yPHeight;
        
        //console.log(centerPixelX,centerPixelY,nPixelsLeft,nPixelsUp,x0,y0,xn,yn,startingX,startingY,);

        //need to start at the x0,y0 position of the blown up pixel and then step along 
        // the modified height/width to render the squares in the viewport
        for(let i = x0; i < xn; i++) {
            for(let j = y0; j < yn; j++) {
                let dataidx = i+j*this.props.xSize;

                if(!this.props.data[dataidx]) continue; //OOB
                if(!this.props.updated[dataidx]) continue;

                this.props.data[dataidx] = this.props.updated[dataidx];
                delete this.props.updated[dataidx]; 

                ctx.fillStyle = this.props.data[dataidx];

                let rx0 = startingX+(i-x0)*xPWidth;
                let ry0 = startingY+(j-y0)*yPHeight;

                //no need to draw out of bounds
                if(rx0 < 0) rx0 = 0;
                else if (rx0 > canvas.width) continue;
                if(ry0 < 0) ry0 = 0;
                else if (ry0 > canvas.height) continue;

                ctx.fillRect(
                    rx0,
                    ry0,
                    xPWidth,
                    yPHeight
                );
                
            }
        }

    }

    addDraw(f) {
        if(typeof f === 'function') this.drawFuncs.push(f);
    }

    drawFuncs = []; // draw(input,args,origin,cmd){} <--- passes operator args
    
    drawSquare() {
        
        console.time('square');

        let canvas = this.props.canvas;
        let ctx = this.props.ctx;

        ctx.clearRect(0,0,canvas.width,canvas.height);

        //xp/yp in canvas coordinates
        let centerX = canvas.width*0.5;
        let centerY = canvas.height*0.5;

        let xPWidth = this.props.xPixelSize*this.props.zoom;
        let yPHeight = this.props.yPixelSize*this.props.zoom;

        //calculate the visible area based on zoom 
        let nPixelsX = Math.ceil(canvas.width/xPWidth); if(nPixelsX > this.props.xSize) nPixelsX = this.props.xSize;
        let nPixelsY = Math.ceil(canvas.height/yPHeight); if(nPixelsY > this.props.ySize) nPixelsY = this.props.ySize;
        
        //first find where we are inside the current pixel based on xP,yP and zoom
        //let gridRelX = this.props.xPosition / this.props.xPixelSize*this.props.xSize; //relative position inside the current pixel (in units)
        //let gridRelY = this.props.yPosition / this.props.yPixelSize*this.props.ySize;

        let currPixelRelX = this.props.xPosition % this.props.xPixelSize;
        let currPixelRelY = this.props.yPosition % this.props.yPixelSize;

        let centerPixelX = Math.floor(this.props.xPosition/this.props.xPixelSize);
        let centerPixelY = Math.floor(this.props.yPosition/this.props.yPixelSize);

        //let curPixelIdx = centerPixelX + this.props.xSize*centerPixelY;
            
        let nPixelsLeft = currPixelRelX;
        while(nPixelsLeft < centerX && nPixelsLeft < xPWidth*this.props.xSize*0.5) {
            nPixelsLeft += xPWidth;
        }
        nPixelsLeft = nPixelsLeft/xPWidth;
        
        let nPixelsUp = currPixelRelY;

        while(nPixelsUp < centerY && nPixelsUp < yPHeight*this.props.ySize*0.5) {
            nPixelsUp += yPHeight;
        }
        nPixelsUp = nPixelsUp/yPHeight;

        let x0 = centerPixelX - Math.floor(nPixelsLeft); // = Math.floor(this.props.xPosition - nPixelsX*0.5);
        let y0 = centerPixelY - Math.floor(nPixelsUp); // = Math.floor(this.props.yPosition - nPixelsY*0.5);

        //ending indices to render against
        let xn = x0+nPixelsX;
        let yn = y0+nPixelsY;

        //now calculate the view window to render rects according to the index colors
        let startingX = centerX - nPixelsLeft*xPWidth;
        let startingY = centerY - nPixelsUp*yPHeight;
        
        //console.log(centerPixelX,centerPixelY,nPixelsLeft,nPixelsUp,x0,y0,xn,yn,startingX,startingY,);

        //need to start at the x0,y0 position of the blown up pixel and then step along 
        // the modified height/width to render the squares in the viewport
        for(let i = x0; i < xn; i++) {
            for(let j = y0; j < yn; j++) {
                let dataidx = i+j*this.props.xSize;

                if(!this.props.data[dataidx]) continue; //OOB

                ctx.fillStyle = this.props.data[dataidx];

                let rx0 = startingX+(i-x0)*xPWidth;
                let ry0 = startingY+(j-y0)*yPHeight;

                //no need to draw out of bounds
                if(rx0 < 0) rx0 = 0;
                else if (rx0 > canvas.width) continue;
                if(ry0 < 0) ry0 = 0;
                else if (ry0 > canvas.height) continue;

                ctx.fillRect(
                    rx0,
                    ry0,
                    xPWidth,
                    yPHeight
                );
                

            }
        }

        console.timeEnd('square');
    }

    canvasClicked = (x,y) => {
        let canvasx = x;
        let canvasy = y;

        //xp/yp in canvas coordinates
        let centerX = this.canvas.width*0.5;
        let centerY = this.canvas.height*0.5;

        let xPWidth = this.props.xPixelSize*this.props.zoom;
        let yPHeight = this.props.yPixelSize*this.props.zoom;
        
        let currPixelRelX = this.props.xPosition % this.props.xPixelSize;
        let currPixelRelY = this.props.yPosition % this.props.yPixelSize;

        //let centerPixelX = Math.floor(this.props.xPosition/this.props.xPixelSize);
        //let centerPixelY = Math.floor(this.props.yPosition/this.props.yPixelSize);

        let clickCenterOffsetX = canvasx-this.canvas.width*0.5;
        let clickCenterOffsetY = canvasy-this.canvas.height*0.5;

        //find the pixel that was clicked
        //console.log(canvasx,canvasy);

        let nPixelsLeft = currPixelRelX;
        while(nPixelsLeft < centerX+clickCenterOffsetX) {
            nPixelsLeft += xPWidth;
        }
        nPixelsLeft = (nPixelsLeft - 0.5*(this.canvas.width - xPWidth * this.props.xSize))/xPWidth;

        let nPixelsUp = currPixelRelY;

        while(nPixelsUp < centerY+clickCenterOffsetY) {
            nPixelsUp += yPHeight;
        }
        nPixelsUp = (nPixelsUp - 0.5*(this.canvas.height - yPHeight * this.props.ySize))/yPHeight;

        //console.log(nPixelsLeft,nPixelsUp);

        let idx = nPixelsLeft + nPixelsUp * this.props.xSize;

        if(this.props.data[idx]) {
            this.props.updated[idx] = this.props.colorPicked;
        }

    }

    //DOMElement custom callbacks:
    oncreate=(props)=>{
        this.canvas = this.querySelector('canvas');
        if(props.width) {
            this.canvas.width = props.width;
            this.canvas.style.height = props.height;
        }
        if(props.height) {
            this.canvas.height = props.height;
            this.canvas.style.height = props.height;
        }
        if(props.style) {
            this.canvas.style = props.style;
            setTimeout(()=>{
                this.canvas.height = this.canvas.clientHeight;
                this.canvas.width = this.canvas.clientWidth;
                        
                this.generateDataStructure();

                this.props.xPosition = this.props.xPixelSize*this.props.xSize * 0.5;
                this.props.yPosition = this.props.yPixelSize*this.props.ySize * 0.5;

                this.drawSquare();
                
            },10); //slight recalculation delay time
        }

        props.canvas = this.canvas;
        if(props.context) props.context = this.canvas.getContext(props.context);
        else props.context = this.canvas.getContext('2d');
        this.context = props.context;
        this.ctx = this.context;
        props.ctx = this.context;

        this.canvas.onmousedown = (ev) => {
            this.canvasClicked(ev.pageX - this.canvas.offsetLeft,ev.pageY - this.canvas.offsetTop);
            this.canvas.onmousemove = (ev) => {
                this.canvasClicked(ev.pageX - this.canvas.offsetLeft,ev.pageY - this.canvas.offsetTop);
            }
            this.canvas.onmouseup = (ev) => {
                this.canvas.onmousemove = undefined;
            }
        };

        //setup menus

        this.querySelector('#zoomin').onclick = (ev) => {
            this.props.zoom += 0.1;
            this.drawSquare();
        }

        this.querySelector('#zoomout').onclick = (ev) => {
            this.props.zoom -= 0.1;
            this.drawSquare();
        }

        this.querySelector('#panleft').onclick = (ev) => {
            this.props.xPosition += this.props.xPixelSize;
            this.drawSquare();
        }

        this.querySelector('#panright').onclick = (ev) => {
            this.props.xPosition -= this.props.xPixelSize;
            this.drawSquare();
        }

        this.querySelector('#panup').onclick = (ev) => {
            this.props.yPosition -= this.props.yPixelSize;
            this.drawSquare();
        }
        
        this.querySelector('#pandown').onclick = (ev) => {
            this.props.yPosition += this.props.yPixelSize;
            this.drawSquare();
        }

        this.querySelector('#colorwheel').onchange = (ev) => {
            console.log(ev.target.value);
            this.props.colorPicked = ev.target.value;
        }

        setTimeout(()=>{if(props.animate) props.node.runAnimation();},10)

    }

    //after rendering
    onresize=(props)=>{
        if(this.canvas) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.canvas.style.width = this.canvas.clientWidth;
            this.canvas.style.height = this.canvas.clientHeight;

            this.drawSquare();
        }
    } //on window resize
    //onchanged=(props)=>{} //on props changed
    //ondelete=(props)=>{} //on element deleted. Can remove with this.delete() which runs cleanup functions

    //generate a color map indexed with ints corresponding to hex values
    generateDataStructure(
        defaultColor=(xCoord,yCoord)=>{
            return `rgb(${255*xCoord/this.props.xSize},0,${255*yCoord/this.props.ySize})`;
        }
    ) {

        for(let i = 0; i < this.props.xSize; i++) {
            for(let j = 0; j < this.props.ySize; j++) {
                let index = i+j*this.props.xSize;
                if(!this.props.data[index]) {
                    if(typeof defaultColor === 'function') this.props.data[index] = defaultColor(i,j);
                    else if (defaultColor) this.data[index] = defaultColor;
                    else this.props.data[index] = `0xFFFFFF`;
                }
            }
        }

        //this.props.keys = Object.keys(this.props.data);
    }

}

//window.customElements.define('custom-', Custom);

PlaceNode.addElement('place-node');
