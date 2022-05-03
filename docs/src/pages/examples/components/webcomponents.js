import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from '../examples.module.css'
import * as brainsatplay from '../../../../../src/core/index';
import '../../../../../src/components/examples/button.node';
import '../../../../../src/components/examples/canvas.node';
import '../../../../../src/components/examples/circlecanvas.node';
import '../../../../../src/components/examples/input.node';
import '../../../../../src/components/examples/place.node';
import '../../../../../src/components/acyclic.graph';
import '../../../../../src/components/graph.node';
import '../../../../../src/components/template.node';
// import '../../../../../src/visualscript/src/components/general/Button';

export default function WebComponentsExample({server, sockets, router}) {
  
    const terminal = useRef(null);
    return (
      <header className={clsx('hero hero--primary')}>

          {/* Web Component Section */}
          <acyclic-graph>
            <graph-node tag='a' input="HELLO WORLD O__O">
                <graph-node tag='b' ></graph-node>
            </graph-node>
            
            Add:<input-node type="number" tag='inp'>
                <button-node tag='btn'>
                    <circlecanvas-node tag='canvas' style={{height: "100%", width: "100%"}}></circlecanvas-node>
                </button-node>
            </input-node> 
            <br></br>
            <place-node
              style={{height:'500px', width:'500px'}}
            >
            </place-node>
        </acyclic-graph>

        {/* Terminal */}
          <div className={styles.terminal} ><textarea ref={terminal} disabled></textarea></div>

      </header>
    );
  }
  