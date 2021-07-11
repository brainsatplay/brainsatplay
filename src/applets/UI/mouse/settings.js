
// import featureImg from './feature.png'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "BCI Mouse",
    devices: ["EEG"],
    author: "Christopher Coogan + Garrett Flynn",
    description: "Control a mouse with your brain",
    categories: ["UI"],
    // "image":  featureImg,
    instructions:"Coming soon...",
    display: {
      production: false
    },
    // App Logic
    graph:
      {
      nodes: [
        {id: 'up', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowUp'}},
        {id: 'down', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowDown'}},
        {id: 'left', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowLeft'}},
        {id: 'right', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowRight'}},
        {id: 'click', class: brainsatplay.plugins.controls.Event, params: {keycode: 'Space'}},
        {id: 'move', class: brainsatplay.plugins.utilities.Move},
        {id: 'cursor', class: brainsatplay.plugins.interfaces.Cursor, params: {}},
      ],
      edges: [

        // Up
        {
          source: 'up', 
          target: 'move:up'
        },

        // Down
        {
          source: 'down', 
          target: 'move:down'
        },

        // Left
        {
          source: 'left', 
          target: 'move:left'
        },

        // Right
        {
          source: 'right', 
          target: 'move:right'
        },

        // X and Y
        {
          source: 'move:dx', 
          target: 'cursor:dx'
        },

        {
          source: 'move:dy', 
          target: 'cursor:dy'
        },

        {
          source: 'click', 
          target: 'cursor:click'
        },
      ]
    },
}
