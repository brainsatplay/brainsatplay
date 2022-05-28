import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from '../examples.module.css'
import { Graph, AcyclicGraph } from '../../../../../src/core/index';

export default function ProcessExample({server, sockets, router}) {
  
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

    // Load a Module
    // const loaded = new brainsatplay.Process(null, null, true)
    // loaded.load(datastreams)
    // console.log(loaded)
    // loaded.list(load.current)

      // ---------------------------- Basic Example ----------------------------
      const add = new Graph({
        tag: 'add',
        increment: 1,
        operator: (self, graphOrigin, input) => input + self.increment
      })

      const log = new Graph({
        tag: 'log',
        operator: (self, graphOrigin, input) => console.log(input)
      })

      add.subscribe(log) // This should output 3 to the console

      const random = new Graph({
        tag: 'random',
        operator: () => Math.floor(100*Math.random())
      })

      random.subscribe((v) => {
        add.increment = v
      })

      log.subscribe(random) // This will update the increment value after every run

      random.run() // initialize random value

      button1.current.onclick = async () => {    
        add.run(2)

        // Get Node Tree
        let list = add.getTree()

        // Show Add Node
        list = {[add.tag]:{
          state: add.state.data[add.tag],
          increment: add.increment,
          nodes: list
        }}

        // Display
        terminal.current.value = JSON.stringify(list, undefined, 4)
      }

      button1.current.click()
      
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
  