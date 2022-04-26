import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from '../examples.module.css'
import * as brainsatplay from '../../../../../src/core/index';
import '../../../../../src/core/webcomponents/examples/button.node';
import '../../../../../src/core/webcomponents/examples/canvas.node';
import '../../../../../src/core/webcomponents/examples/circlecanvas.node';
import '../../../../../src/core/webcomponents/examples/input.node';
import '../../../../../src/core/webcomponents/acyclic.graph';
import '../../../../../src/core/webcomponents/graph.node';
import '../../../../../src/core/webcomponents/template.node';
// import '../../../../../src/visualscript/src/components/general/Button';

export default function WebComponentsExample({server, sockets, router}) {
  
    const terminal = useRef(null);
    return (
      <header className={clsx('hero hero--primary')}>

          {/* Web Component Section */}
          <acyclic-graph>
            <graph-node input="HELLO WORLD O__O">
                <graph-node></graph-node>
            </graph-node>
            
            Add:<input-node type="number">
                <button-node>
                    <circlecanvas-node style={{height: "100%", width: "100%"}}></circlecanvas-node>
                </button-node>
            </input-node> 
        </acyclic-graph>

        {/* Terminal */}
          <div className={styles.terminal} ><textarea ref={terminal} disabled></textarea></div>

      </header>
    );
  }
  