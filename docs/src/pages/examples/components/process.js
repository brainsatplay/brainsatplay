import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from '../examples.module.css'
import * as graph from './../../../../../src/graph';

export default function ProcessExample({server, endpoints, router}) {
  
    const button1 = useRef(null);
    const button2 = useRef(null);
    const terminal = useRef(null);
    const test = useRef(null);

    useEffect(async () => {


    // import * as graph from "./dist/index.esm.js"
    // ---------------- Create Processs ----------------
    const parent = new graph.Process(null, null, true)
    const upstream = new graph.Process(null, null, true)
    const func = (self, input) => {
      console.log('Increment Value', self.get('increment'), self.get('increment')?.value)
        return input + self.get('increment')?.value
    }
    const internal = new graph.Process(func, null, true)
    const downstream = new graph.Process((self, input) => {
        const output = input + 1
        terminal.current.insertAdjacentHTML(`beforeend`, `<p>Output: ${output}</p>`)
        return output
    }, null, true)

    // ---------------- Set Upstream Functions ----------------
    upstream.set('increment', 1)
    const functionProcess = upstream.set('function', func) // or upstream.get('function')
    const processProcess = upstream.set('process', internal)

    // ---------------- Subscribe to Upstream ----------------
    functionProcess.subscribe(downstream)
    processProcess.subscribe(downstream)
    downstream.subscribe(upstream.get('increment')) // change incrementer

    // ---------------- Populate Parent ----------------
    parent.set('upstream', upstream)
    parent.set('downstream', downstream)

    // ---------------- Run Values to Upstream ----------------
    const input = 2
    terminal.current.insertAdjacentHTML(`beforeend`, `<strong>First Run</strong>`)
    await functionProcess.run(input)
    await processProcess.run(input)
    
    parent.list(test.current)

    const exported = parent.export()

    // Load the Exported PRocess
    const loaded = new graph.Process()
    loaded.load(exported)
    terminal.current.insertAdjacentHTML(`beforeend`, `<strong>Second Run</strong>`)
    loaded.processes.get('upstream').processes.get('function').run(input)
    loaded.processes.get('upstream').processes.get('process').run(input)

      button1.current.onclick = () => {
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

      button2.current.onclick = () => {        
        // router.get({
        //   route: 'services',
        //   endpoint: endpoints[1]
        // }).then(res => {
        //   if (!res?.error) output.current.innerHTML = JSON.stringify(res)
        //   else output.current.innerHTML = res.error
  
        // }).catch(err => {
        //   output.current.innerHTML = err.error
        // })
      }
      
    });
  
    return (
      <header className={clsx('hero hero--primary')}>
        <div className="container">
          <div>
            <button ref={button1} className="button button--secondary button--lg">Ping 1</button>
            <button ref={button2} className="button button--secondary button--lg">Ping 2</button>
          </div>
          <div ref={test}>
          </div>

          <div className={styles.terminal}><span ref={terminal}></span></div>

        </div>
      </header>
    );
  }
  