import React from 'react';
import clsx from 'clsx';
import styles from './examples.module.css';
import MultipleExample from './components/multiple';
import { useHistory } from 'react-router';
import AllExample from './components/all';
import WebRTCExample from './components/webrtc';
import StreamsExample from './components/streams';

export default function ExampleSelector({server, endpoints, router, id}) {
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
            endpoints={endpoints}
          />

          case 'multiple':
            return <MultipleExample
            server={server}
            router={router}
            endpoints={endpoints}
            />

          case 'webrtc':
            return <WebRTCExample
            server={server}
            router={router}
            endpoints={endpoints}
            id={id}
            />

          case 'streams':
            return <StreamsExample
            server={server}
            router={router}
            endpoints={endpoints}
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
          Multiple Remote Endpoints
        </button>
        <button onClick={() => set('webrtc')}>
          WebRTC
        </button>
        <button onClick={() => set('streams')}>
          Streams
        </button>
        </nav>

        <header>
            {renderExample(example)}
        </header>
        </>
    );
  }
  