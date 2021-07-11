
import featureImg from './feature.png'
import {UI} from './UI.js'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "Snake",
    devices: ["EEG"],
    author: "Christopher Coogan + Garrett Flynn",
    description: "Let's play Snake!",
    categories: ["Play"],
    // "image":  featureImg,
    instructions:"Coming soon...",
    bonanza: {
      minTime: 60, // s
    },
    image: featureImg,

    // App Logic
    graph:
      {
      nodes: [
        {id: 'up', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowUp'}},
        {id: 'down', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowDown'}},
        {id: 'left', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowLeft'}},
        {id: 'right', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowRight'}},
        {id: 'ui', class: UI, params: {}},
      ],
      edges: [
        {
          source: 'up', 
          target: 'ui:up'
        },
        {
          source: 'down', 
          target: 'ui:down'
        },
        {
          source: 'left', 
          target: 'ui:left'
        },
        {
          source: 'right', 
          target: 'ui:right'
        },
      ]
    },
}
