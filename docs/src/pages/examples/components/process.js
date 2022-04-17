import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from '../examples.module.css'
import * as brainsatplay from '../../../../../src/core/graph';
import { ProcessGraph, Process } from '../../../../../src/core/graph/Process2';

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
    // ---------------- Create Processs ----------------
    const parent = new brainsatplay.Process(null, null, true)

    const func = (self, input, increment, multiplier) => {
        const output = multiplier * (input + increment)
        terminal.current.insertAdjacentHTML(`beforeend`, `<p>Upstream: ${input} + ${increment} = ${output}</p>`)
        return output
    }

    const upstream = new brainsatplay.Process(func, null, true)

    // const internal = new brainsatplay.Process(func, null, true)
    const downstream = new brainsatplay.Process((self, input) => {
        const output = input + 1
        terminal.current.insertAdjacentHTML(`beforeend`, `<p>Downstream: ${input} + ${1} = ${output}</p>`)
        return output
    }, null, true)

    // ---------------- Set Upstream Functions ----------------
    const increment = upstream.set('increment', 1) // set input arguments
    upstream.set('multiplier', 1) // set input arguments

    // const functionProcess = upstream.set('function', func) // or upstream.get('function')
    // const processProcess = upstream.set('process', internal)

    // ---------------- Subscribe to Upstream ----------------
    upstream.subscribe(downstream) // notify downstream of update
    // processProcess.subscribe(downstream)
    downstream.subscribe(increment) // update increment argument

    // ---------------- Populate Parent ----------------
    parent.set('upstream', upstream)
    parent.set('downstream', downstream)

    // ---------------- Run Values ----------------
    const input = 2    
    parent.list(display.current)

    const exported = parent.export()

    // Load the Exported Process
    const imported = new brainsatplay.Process(null, null, true)
    imported.import(exported)
    imported.list(copy.current)
    console.log(imported, exported)


    //new version

    let graph = new ProcessGraph();

    let upstreamProps = {
      tag:'upstream',
      increment:1,
      multiplier:2,
      operator:(self,input)=>{
        let output = self.increment + self.multiplier;
        terminal.current.insertAdjacentHTML(`beforeend`, `<p>Upstream: ${input} + ${self.increment} = ${output}</p>`)
        return output;
      }
    }

    let upstream2 = graph.addNode(upstreamProps);

    let downstreamNode = graph.create((self,input)=>{
      const output = input+1;
      terminal.current.insertAdjacentHTML(`beforeend`, `<p>Downstream: ${input} + ${1} = ${output}</p>`);
      return output;
    },undefined,{tag:'downstream'});

    upstream2.subscribeNode(downstreamNode);

    upstream2.run(5);

    upstream2.increment = 3;
    upstream2.multiplier = 10;


    // Load a Module
    // const loaded = new brainsatplay.Process(null, null, true)
    // loaded.load(datastreams)
    // console.log(loaded)
    // loaded.list(load.current)


      button1.current.onclick = async () => {
        terminal.current.innerHTML =  ''

        console.log('Run Graph #1', parent)
        await graph.getNode('upstream').run(input)
        display.current.innerHTML =  `<h3>Original</h3><strong>Input: ${input}`
        copy.current.innerHTML = `<h3>Copy</h3><strong>Input: ${input}`
        parent.list(display.current)

        console.log('Run Graph #2', imported)
        await imported.processes.get('upstream').run(input)
        imported.list(copy.current)

        // router.get({
        //   route: 'services',
        //   endpoint: endpoints[0]
        // }).then(res => {
        //   if (!res?.error) output.current.innerHTML = JSON.stringify(res)
        //   else output.current.innerHTML = res.error
  
        // }).catch(err => {
        //   output.current.innerHTML = err.error
        // })
      }


      // ---------------------------- Basic Example ----------------------------
      const add = new brainsatplay.Process((self, input, increment) => input + increment, null, true)
      add.set('increment', 1) // or add.set(0, 1)

      const log = new brainsatplay.Process((self, input) => console.log(input), null, true)
      add.subscribe(log) // This should output 3 to the console

      const random = new brainsatplay.Process(() => Math.floor(100*Math.random()), null, true)
      const inc2 = add.set('increment', random)
      log.subscribe(inc2) // This will update the increment value after every run
      random.run()

      button2.current.onclick = async () => {    
        add.run(2)
      }
      
    });
  
    return (
      <header className={clsx('hero hero--primary')}>
          <div>
            <button ref={button1} className="button button--secondary button--lg">Run</button>
            <button ref={button2} className="button button--secondary button--lg">Test</button>
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

          <div className={styles.terminal}><span ref={terminal}></span></div>

      </header>
    );
  }
  