import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import styles from '../examples.module.css'
import RouteDisplay from '../routeDisplay';

export default function AllExample({server, sockets, router}) {

  const [routes, setRoutes] = useState({});

    const buttons = useRef(null);
    const output = useRef(null);

    let buttonRef = buttons.current
    let outputRef = output.current


    router.subscribe((o) => {
        console.log('Remote #1 Subscription', o)
        let data = o.message
        if (o.route === 'routes') setRoutes(o.message[0])
        else {
        
        // Subscription Responses
        if (!data?.error) if (outputRef) outputRef.innerHTML = JSON.stringify(data, undefined, 2)
        else if (outputRef) outputRef.innerHTML = data.error

      }
    }, {protocol: 'http', routes: ['routes', 'osc'], socket: sockets[0]})

    useEffect(async () => {
      buttonRef = buttons.current
      outputRef = output.current
    });

    useEffect(() => {
      send('routes', 'get')
    }, [])

    async function send(route, method, ...args){

      return await router[method]({
        route,
        socket: sockets[0]
      }, ...args).then(res => {

        if (!res?.error) {
          if (res && route === 'routes') setRoutes(res[0])
          if (outputRef) outputRef.innerHTML = JSON.stringify(res, undefined, 2)
        } else if (outputRef) outputRef.innerHTML = res.error

        return res
      }).catch(err => {
        console.log('err', err)

        if (outputRef) outputRef.innerHTML = err.error
      })

    }
  
    return (
      <header className={clsx('hero hero--primary')}>
        <div className="container">
          <h1 className="hero__title">All Routes</h1>
          <div className={styles.terminal} ><textarea ref={output} disabled></textarea></div>
          <RouteDisplay routes={routes} sendCallback={send}/>
        </div>
      </header>
    );
  }
  