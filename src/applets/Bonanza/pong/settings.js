
// import featureImg from './feature.png'
import {UI} from './UI.js'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "Pong",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Let's play Pong!",
    categories: ["Train"],
    // "image":  featureImg,
    instructions:"Coming soon...",
    bonanza: {
      minTime: 60, // s
    },

    // App Logic
    graph:
      {
      nodes: [
        {id: 'up', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'ArrowUp'}},
        {id: 'down', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'ArrowDown'}},
        {id: 'move', class: brainsatplay.plugins.utilities.Move},
        {id: 'ui', class: UI, params: {}},
      ],
      edges: [

        // Paddle Position
        {
          source: 'up', 
          target: 'move:up'
        },
        {
          source: 'down', 
          target: 'move:down'
        },

        // Y Movement
        {
          source: 'move:dy', 
          target: 'ui:paddle'
        },
      ]
    },
}
