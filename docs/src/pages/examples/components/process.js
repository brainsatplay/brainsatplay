import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from '../examples.module.css'
import * as graph from './../../../../../src/graph';

export default function ProcessExample({server, endpoints, router}) {
  
    const button1 = useRef(null);
    const button2 = useRef(null);
    const terminal = useRef(null);
    const display = useRef(null);
    const copy = useRef(null);
    const load = useRef(null);

    useEffect(async () => {

      const datastreams = await import('https://cdn.jsdelivr.net/npm/datastreams-api@latest/dist/index.esm.js')
      console.log(datastreams)
    // import * as graph from "./dist/index.esm.js"
    // ---------------- Create Processs ----------------
    const parent = new graph.Process(null, null, true)

    const func = (self, input, increment, second) => {
        const output = input + increment
        terminal.current.insertAdjacentHTML(`beforeend`, `<p>Upstream: ${input} + ${increment} = ${output}</p>`)
        return output
    }

    const upstream = new graph.Process(func, null, true)

    const internal = new graph.Process(func, null, true)
    const downstream = new graph.Process((self, input) => {
        const output = input + 1
        terminal.current.insertAdjacentHTML(`beforeend`, `<p>Downstream: ${input} + ${1} = ${output}</p>`)
        return output
    }, null, true)

    // ---------------- Set Upstream Functions ----------------
    upstream.set('increment', 1) // set input arguments
    const functionProcess = upstream.set('function', func) // or upstream.get('function')
    const processProcess = upstream.set('process', internal)

    // ---------------- Subscribe to Upstream ----------------
    upstream.subscribe(downstream) // notify downstream of update
    // processProcess.subscribe(downstream)
    downstream.subscribe(upstream.get('increment')) // update increment argument

    // ---------------- Populate Parent ----------------
    parent.set('upstream', upstream)
    parent.set('downstream', downstream)

    // ---------------- Run Values to Upstream ----------------
    const input = 2    
    parent.list(display.current)

    const exported = parent.export()

    // Load the Exported Process
    const imported = new graph.Process(null, null, true)
    imported.import(exported)
    imported.list(copy.current)
    console.log(imported, exported)

    // Load a Module
    const loaded = new graph.Process(null, null, true)
    loaded.load(datastreams)
    console.log(loaded)
    loaded.list(load.current)


      button1.current.onclick = async () => {
        terminal.current.innerHTML =  ''

        console.log('Run Graph #1')
        await upstream.run(input)
        display.current.innerHTML =  copy.current.innerHTML = `<strong>Input: ${input}`
        parent.list(display.current)

        console.log('Run Graph #2')
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

      // button2.current.onclick = async () => {    
      //   await processProcess.run(input) 
      //     loaded.processes.get('upstream').processes.get('process').run(input)
   
      //   // router.get({
      //   //   route: 'services',
      //   //   endpoint: endpoints[1]
      //   // }).then(res => {
      //   //   if (!res?.error) output.current.innerHTML = JSON.stringify(res)
      //   //   else output.current.innerHTML = res.error
  
      //   // }).catch(err => {
      //   //   output.current.innerHTML = err.error
      //   // })
      // }
      
    });
  
    return (
      <header className={clsx('hero hero--primary')}>
          <div>
            <button ref={button1} className="button button--secondary button--lg">Run</button>
            {/* <button ref={button2} className="button button--secondary button--lg">Ping 2</button> */}
          </div>
          <br/>
          <div ref={display}>
          </div>
          <div ref={copy}>
          </div>
          <div ref={load}>
          </div>

          <div className={styles.terminal}><span ref={terminal}></span></div>

      </header>
    );
  }
  