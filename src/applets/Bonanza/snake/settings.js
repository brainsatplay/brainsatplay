
import featureImg from './feature.png'
import {UI} from './UI.js'

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
        {name: 'up', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowUp'}},
        {name: 'down', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowDown'}},
        {name: 'left', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowLeft'}},
        {name: 'right', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowRight'}},
        {name: 'ui', class: UI, params: {}},
        {name: 'document', class: brainsatplay.plugins.interfaces.UI},      
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
        
        {
          source: 'ui:element', 
          target: 'document:content'
        }
      ]
    },
}
