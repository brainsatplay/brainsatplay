import React from 'react';
import clsx from 'clsx';
import styles from './examples.module.css';
import MultipleExample from './components/multiple';
import { useHistory } from 'react-router';
import AllExample from './components/all';
import WebRTCExample from './components/webrtc';
import StreamsExample from './components/streams';
import ProcessExample from './components/process';
import Process2Example from './components/process2';
import WebComponentsExample from './components/webcomponents';

export default function ExampleSelector({server, sockets, router, id}) {
   const history = useHistory();
    var url = window.location;
    var name = new URLSearchParams(url.search).get('name');
    const [example, setExample] = React.useState(name ?? 'routes');


    const renderExample = (name) => {
        switch(name) {
          case 'routes':
            return <AllExample
            server={server}
            router={router}
            sockets={sockets}
          />

          case 'multiple':
            return <MultipleExample
            server={server}
            router={router}
            sockets={sockets}
            />

          case 'webrtc':
            return <WebRTCExample
            server={server}
            router={router}
            sockets={sockets}
            id={id}
            />

          case 'streams':
            return <StreamsExample
            server={server}
            router={router}
            sockets={sockets}
          />

          case 'process':
            return <ProcessExample
            server={server}
            router={router}
            sockets={sockets}
            id={id}
            />

          case 'process2':
            return <Process2Example
            server={server}
            router={router}
            sockets={sockets}
            id={id}
            />

          case 'webcomponents':
            return <WebComponentsExample
            server={server}
            router={router}
            sockets={sockets}
            id={id}
            />
        }
      }

    const set = (name) => {
      history.replace(`/examples?name=${name}`)
      setExample(name)
    }
  
    return (
        <>
      <nav className={clsx(styles.nav)}>
        <button onClick={() => set('routes')}>
          All Routes
        </button>
        <button onClick={() => set('multiple')}>
          Multiple Remote Sockets
        </button>
        <button onClick={() => set('webrtc')}>
          WebRTC
        </button>
        <button onClick={() => set('streams')}>
          Streams
        </button>
        <button onClick={() => set('process')}>
          Graph
        </button>
        <button onClick={() => set('process2')}>
          Graph Animation
        </button>
        <button onClick={() => set('webcomponents')}>
          WebComponents
        </button>
        </nav>

        <header>
            {renderExample(example)}
        </header>
        </>
    );
  }
  