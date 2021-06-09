
import {UI} from './UI.js'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "My First Applet",
    devices: ["EEG"],
    author: "Brains@Play",
    description: "This is my first applet.",
    categories: ["tutorial"],
    instructions:"Coming soon...",
    intro: {
      mode: 'single'
    },
    display: {
      production: false
    },

    // App Logic
    graph:
      {
      nodes: [
        {id: 'ui', class: UI, params: {}},
        {id: 'signal', class: brainsatplay.plugins.inputs.Signal},
        {id: 'neurofeedback', class: brainsatplay.plugins.algorithms.Neurofeedback, params: {}},
      ],
      edges: [
        {
          source: 'signal', 
          target: 'neurofeedback'
        },
        {
          source: 'neurofeedback', 
          target: 'ui'
        }
      ]
    },
}
