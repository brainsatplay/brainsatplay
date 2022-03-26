import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from '../examples.module.css'
import { randomId } from '../../../../../src/common/id.utils';
import RouteDisplay from '../routeDisplay';

export default function WebRTCExample({server, endpoints, router, id}) {
  
    const send = useRef(null);
    const connect = useRef(null);
    const disconnect = useRef(null);
    const output = useRef(null);
    const peerDiv = useRef(null);
    const meReadout = useRef(null);

    const peers = {}


  const webrtcClient = router.SERVICES['webrtc']
  webrtcClient.onpeerconnect = async (ev) => {

    const id = ev.detail.id
    peers[id] = {
      element: document.createElement('div'),
      readout: document.createElement('span'),
    }

    peers[id].element.insertAdjacentHTML('beforeend',`<strong>${id}: </strong>`)
    peers[id].element.insertAdjacentElement('beforeend', peers[id].readout)

    peerDiv.current.insertAdjacentElement('beforeend', peers[id].element)

    webrtcClient.openDataChannel({
      peer: id, // Peer ID
    })
    // .then(o => {
    //       // Manually track channels and subscribe
    //       channels.set(o.peer, o) // Sending End
    //       o.subscribe((dict) => {
    //         console.log('wirks!')
    //           peers[o.peer].readout.innerHTML += dict.message ?? dict.route
    //       })
    //   })
  }

  webrtcClient.onpeerdisconnect = (ev) => {
    peers[ev.detail.id].element.remove()
    delete peers[ev.detail.id]
  }

  let endpoint;

    useEffect(() => {
      
      connect.current.onclick = () => {


        // Can be Room or Peer
        endpoint = router.connect({
          type: 'webrtc',
          target: 'rooms/myroom', // e.g. 'rooms/myroom', 'peers/test'
          link: endpoints[1],
          credentials: {id, _id:id}
        })
        
        endpoint.subscribe((res) => {
          console.log('Peer message...', res); 

          if (!res?.error) {
            
            // Print to Terminal and Peer Readout
            output.current.innerHTML = JSON.stringify(res)
            if (peers[res.id]) peers[res.id].readout.innerHTML += res.message ?? res.route

          } else output.current.innerHTML = res.error 

        })
      }

      send.current.onclick = () => {
        let route = 'ping'
        meReadout.current.innerHTML += route
        endpoint.send({route})
      }

      disconnect.current.onclick = () => {
        peerReference.delete({
          route: 'webrtc/user',
          // endpoint: endpoints[1]
        })
      }

    });
  
    return (
      <header className={clsx('hero hero--primary')}>
        <div className="container">
          <div>
            <button ref={connect} className="button button--secondary button--lg">Connect</button>
            <button ref={send} className="button button--secondary button--lg">Ping</button>
            <button ref={disconnect} className="button button--secondary button--lg">Disconnect</button>
          </div>
          <div><strong>Me: </strong><span ref={meReadout}></span></div>
          <div ref={peerDiv}></div>
          <div className={styles.terminal}><span ref={output}></span></div>

        </div>
      </header>
    );
  }
  