import React, { useEffect, useRef } from 'react';

export default function RouteDisplay({routes, sendCallback}) {
  
    const container = useRef(null);

    let vals = {
      'add': 0
    }

    let divs = {}

    useEffect(async () => {
      
        divs = {}
        if (container.current) container.current.innerHTML = ''
  
        for (let route in routes){
          const o = routes[route]
  
          let test = o.route.split('/')
          let service = (test.length < 2) ? 'Base' : test[0]
          let name = (test.length < 2) ? test[0] : test[1]
  
          if (!divs[service]){
            divs[service] = document.createElement('div')
            divs[service].innerHTML = `<h2>${service}</h2>`
            divs[service].style.padding = '20px'
            if (container.current) container.current.insertAdjacentElement('beforeend', divs[service])
          }
  
          
          // o = {route: string, arguments: []}
          let button = document.createElement('button')
          button.className = 'button button--secondary button--lg'
          button.innerHTML = name
          button.onclick = async ( ) => {
            let args = []
            if (o.route === 'unsafe/createRoute') args = [{
              route: 'add',
              post: (_, [a, b=1]) => a + b
            }]
            else if (o.route === 'add') args = [vals['add']?.[0]]
            else if (o.route === 'http/add') args = ['/arbitrary/route', '<p>Just some arbitrary HTML</p>']
  
            // Sending Over HTTP Response
            sendCallback(o.route, 'post', ...args).then(res => {
              vals[o.route] = res
            })
          }
  
          divs[service].insertAdjacentElement('beforeend', button)
        }
    });
  
    return (
        <div ref={container}>
        </div>
    );
  }
  