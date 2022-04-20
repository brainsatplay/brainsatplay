import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from '../examples.module.css'
import * as brainsatplay from '../../../../../src/core/graph/Process2';

export default function Process2Example({server, endpoints, router}) {
  
    const button1 = useRef(null);
    const button2 = useRef(null);
    const terminal = useRef(null);
    const display = useRef(null);
    const copy = useRef(null);
    const load = useRef(null);

    useEffect(async () => {

      // ------------------------------ Basic Graph Example ------------------------------ 
      let tree = { //top level should be an object, children can be arrays of objects
        tag:'top',
        operator:(input,self,origin,cmd)=>{
            if(typeof input === 'object') {
                if(input?.x) self.x = input.x; 
                if(input?.y) self.y = input.y;
                if(input?.z) self.z = input.z;
                console.log('top node, input:', input);
            }
            if(cmd === 'animate') {//seizure mode
                if(document.body.style.backgroundColor === 'white') 
                    document.body.backgroundColor = 'black';
                else document.body.style.backgroundColor = 'white';
            }
            return input;
        }, //input is the previous result if passed from another node. node is 'this' node, origin is the previous node if passed
        forward:true, //forward prop: returned outputs from the operator are passed to children operator(s)
        //backward:true, //backprop: returned outputs from the operator are passed to the parent operator
        x:3, //arbitrary properties available on the node variable in the operator 
        y:2,
        z:1,
        animate:true,
        delay:1000,//, //can timeout the operation
        //frame:true //can have the operation run via requestAnimationFrame (throttling)
        //repeat:3 //can repeat an operator, or use "recursive" for the same but passing the node's result back in
        children:{ //object, array, or tag. Same as the 'next' tag in Sequencer.js
            tag:'next', //tagged nodes get added to the node map by name, they must be unique! non-tagged nodes are only referenced internally e.g. in call trees
            operator:(input,self,origin,cmd)=>{
                if(origin.x) { //copy over the coordinates
                    self.x = origin.x;
                    self.y = origin.y;
                    self.z = origin.z;
                }
                console.log('next node \n parent node:',node,'\ninput',input);
            }, // if you use a normal function operator(input,node,origin){} then you can use 'this' reference instead of 'node', while 'node' is more flexible for arrow functions etc.
            //etc..
            delay:500,
            repeat:3
        }
    };


    // ------------------------------ Basic Animation Example ------------------------------ 
    let circle = {
      canvas:document.querySelector('canvas'),
      ctx:document.querySelector('canvas').getContext('2d'),
       radius:20,
       triggered:false,

       operator:(
           self,
           input,
           origin,
           cmd
       )=>{ 
           
           if(!self.triggered) {
            self.radius += Math.random()-0.5;
           }

           if(cmd === 'animate') {
            self.draw(input, self, origin, cmd);
               console.log(self)
              //  for(let i = 0; i < node.drawFuncs.length; i++) { //lets use other nodes to send draw functions to the canvas
              //      let f = node.drawFuncs[i];
              //      if(typeof f === 'function') {
              //          f(input,node,origin,cmd); //pass the args in (need these if you pass arrow functions)
              //      }
              //  }
           } else {
               if(typeof input === 'object') {
                   if(input.radius) self.radius += input.radius;
                   self.triggered = true;
               } else if (typeof input === 'number') {
                self.radius += input;
                self.triggered = true;
               } else if (typeof input === 'string') {
                self.radius += parseFloat(input);
                self.triggered = true;
               } else {
                self.radius += Math.random()-0.5;
                self.triggered = true;
               }
           }

           return node.radius;
       },
       draw:(input,self,origin,cmd) => {
          console.log(self)
           let canvas = self.canvas;
           let ctx = self.ctx;
           if(self.radius <= 1) self.radius = 1;
           ctx.clearRect(0,0,canvas.width,canvas.height);
           self.drawCircle(
                self,
               canvas.width*0.5,
               canvas.height*0.5,
               self.radius,
               'green',
               5,
               '#003300'
           );
       },
       drawCircle:(self, centerX, centerY, radius, fill='green', strokewidth=5, strokestyle='#003300') => {
        self.ctx.beginPath();
        self.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        self.ctx.fillStyle = fill;
        self.ctx.fill();
        self.ctx.lineWidth = strokewidth;
        self.ctx.strokeStyle = strokestyle;
        self.ctx.stroke();
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
   }; //can specify properties of the element which can be subscribed to for changes.

    
    
    let graph = new brainsatplay.AcyclicGraph();
    // graph.addNode(tree);
    // let res = graph.run(tree.tag,{x:4,y:5,z:6}).then(res => console.log('promise, after', res));
    const node = graph.addNode(circle);
    const node2 = graph.create((input,self,origin,cmd) => {
        console.log("Circle Radius: ",input);
    });

    node.subscribeNode(node2);
    //OR:
    //graph.subscribeNode(node,node2);

    let res = graph.run(circle.tag).then(res => console.log('promise, after', res));
    
    button1.current.onclick = () => {
      node.radius++
    }
      
    });
  
    return (
      <header className={clsx('hero hero--primary')}>
          <div>
            <button ref={button1} className="button button--secondary button--lg">Run</button>
            {/* <button ref={button2} className="button button--secondary button--lg">Test</button> */}
          </div>
          <br/>
          <div ref={display}>
            <h3>Original</h3>
          </div>
          <div ref={copy}>
            <h3>Copy</h3>
          </div>
          <div ref={load}>
          </div>
          <canvas></canvas>

          <div className={styles.terminal}><span ref={terminal}></span></div>

      </header>
    );
  }
  