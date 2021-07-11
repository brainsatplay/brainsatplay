
import featureImg from './feature.png'
import {UI} from './UI.js'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "MindPong",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Let's play Pong with our minds!",
    categories: ["Train"],
    // "image":  featureImg,
    instructions:"Coming soon...",
    bonanza: {
      minTime: 60, // s
    },
    image: featureImg,

    canTrain: true,

    // App Logic
    graph:
      {
      nodes: [
        {id: 'up', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowUp'}},
        {id: 'down', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowDown'}},
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
