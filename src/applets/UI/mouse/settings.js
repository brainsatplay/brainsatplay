
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
    intro: {
      mode: 'single'
    },
    display: {
      production: false
    },
    // App Logic
    graphs: [
      {
      id: 'mygraph',
      nodes: [
        {id: 'up', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'ArrowUp'}},
        {id: 'down', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'ArrowDown'}},
        {id: 'left', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'ArrowLeft'}},
        {id: 'right', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'ArrowRight'}},
        {id: 'click', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'Space'}},
        {id: 'cursor', class: brainsatplay.plugins.outputs.Cursor, params: {}},
      ],
      edges: [
        {
          source: 'up', 
          target: 'cursor:up'
        },
        {
          source: 'down', 
          target: 'cursor:down'
        },
        {
          source: 'left', 
          target: 'cursor:left'
        },
        {
          source: 'right', 
          target: 'cursor:right'
        },
        {
          source: 'click', 
          target: 'cursor:click'
        },
      ]
    }],
}
