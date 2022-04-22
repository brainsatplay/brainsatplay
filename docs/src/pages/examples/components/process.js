import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from '../examples.module.css'
import * as brainsatplay from '../../../../../src/core/graph';
import { ProcessGraph, Process, GraphNode } from '../../../../../src/core/graph/Process2';

export default function ProcessExample({server, endpoints, router}) {
  
    const button1 = useRef(null);
    const button2 = useRef(null);
    const terminal = useRef(null);
    const display = useRef(null);
    const copy = useRef(null);
    const load = useRef(null);

    useEffect(async () => {

      const datastreams = await import('https://cdn.jsdelivr.net/npm/datastreams-api@latest/dist/index.esm.js')
      // console.log(datastreams)
    // import * as graph from "./dist/index.esm.js"


    const input = 2
    let graph = new ProcessGraph();

    let upstreamProps = {
      tag:'upstream',
      increment:1,
      multiplier:2,
      operator:(input,self)=>{
        let output =  self.multiplier*(input + self.increment);
       console.log(`Upstream: ${self.multiplier}*(${input} + ${self.increment}) = ${output}`)        
       return output;
      }
    }

    let upstream2 = graph.addNode(upstreamProps);
    let downstream2 = graph.create((input,self)=>{
      const output = input+1;
      console.log(`Downstream: ${input} + ${1} = ${output}`)        
      return output;
    }); //add a tag to make it easier to find

    //subscribe a node
    let sub = upstream2.subscribeNode(downstream2);
    //upstream2.unsubscribe(sub);
    
    //subscribe a function
    let sub2 = upstream2.subscribe((output)=>{console.log('upstream output: ', output);});
    //upstream2.unsubscribe(sub2);


    console.log('----------------- Run Upstream #2 -----------------')
    upstream2.increment = 3;
    upstream2.multiplier = 10;
    upstream2.run(5); //run with an input

    let json = upstream2.print()
    let json2 = downstream2.print()

    console.log('----------------- RECONSTRUCTING UPSTREAM #2... -----------------')
    let reconstructed1 = graph.reconstruct(json);
    let reconstructed2 = graph.reconstruct(json2);
    reconstructed1.subscribe(reconstructed2);
    console.log('----------------- Run Reconstructed Upstream #2 -----------------')
    reconstructed1.run(5);


    //another way to make the node

    upstreamProps.tag = 'upstream3';

    let upstream3 = new Process(upstreamProps,undefined,graph);
    //another instantiation 
    console.log('----------------- Run Upstream #3 -----------------')
    upstream3.run(6)


    //another example

    let flow = {
      tag:'upstream2',
      increment:1,
      multiplier:2,
      operator:(input,self)=>{
        let output =  self.multiplier*(input + self.increment);
       console.log(`Upstream: ${self.multiplier}*(${input} + ${self.increment}) = ${output}`)        
       return output;
      },
      forward:true,
      children:{
        tag:'downstream2',
        operator:(input,self)=>{
          const output = input+1;
          console.log(`Downstream: ${input} + ${1} = ${output}`)        
          return output;
        }
      }
    }


    console.log('----------------- Run Flow -----------------')
    let flowNode = new Process(flow,undefined,graph);
    let res = await flowNode.run(6);

    console.log('----------------- Run Upstream #2 -----------------')
    let res2 = await graph.run('upstream2',7);
    console.log(res,res2);

    // Load a Module
    // const loaded = new brainsatplay.Process(null, null, true)
    // loaded.load(datastreams)
    // console.log(loaded)
    // loaded.list(load.current)

      button1.current.onclick = async () => {
        terminal.current.innerHTML =  ''
        console.log('----------------- Run Graph  #1 -----------------')
        console.log('Input', input)

        await graph.getNode('upstream').run(input)


        console.log('----------------- Run Graph #2 -----------------')
        await graph.getNode('upstream2').run(input)

        const list = graph.tree()
        terminal.current.value = JSON.stringify(list, undefined, 4)

      }

      button1.current.click()


      // ---------------------------- Basic Example ----------------------------
      const add = new Process({
        increment: 1,
        operator: (input, self) => input + self.increment
      })

      const log = new Process({
        operator: (input) => console.log(input)
      })

      add.subscribe(log) // This should output 3 to the console

      const random = new Process({
        operator: () => Math.floor(100*Math.random())
      })

      random.subscribe((v) => {
        add.increment = v
      })

      log.subscribe(random) // This will update the increment value after every run


      random.run() // initialize random value

      button2.current.onclick = async () => {    
        add.run(2)
        const list = add.tree()
        console.log(add)
        terminal.current.value = JSON.stringify(list, undefined, 4)

      }
      
    });
  
    return (
      <header className={clsx('hero hero--primary')}>
          <div>
            <button ref={button1} className="button button--secondary button--lg">Run</button>
            <button ref={button2} className="button button--secondary button--lg">Test</button>
          </div>
          <br/>
          {/* <div ref={display}>
            <h3>Original</h3>
          </div>
          <div ref={copy}>
            <h3>Copy</h3>
          </div> */}
          {/* <div ref={load}>
          </div> */}

          <div className={styles.terminal} style={{height: '300px'}}><textarea ref={terminal} disabled></textarea></div>

      </header>
    );
  }
  