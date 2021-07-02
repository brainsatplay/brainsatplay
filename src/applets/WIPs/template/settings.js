
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import {UI} from './UI.js'
export const settings = {
    name: "Neurofeedback Template",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Get started building a neurofeedback app!",
    categories: ["learn"],
    instructions:"Coming soon...",
    display: {
      production: false,
      development: false
    },

    intro: {
      title:false
    },

    // App Logic
    graph:
    {
      nodes: [
        {id: 'signal', class: brainsatplay.plugins.inputs.Signal},
        {id: 'neurofeedback', class: brainsatplay.plugins.algorithms.Neurofeedback, params: {}},
        {id: 'brainstorm', class: brainsatplay.plugins.utilities.Brainstorm, params: {}},
        {id: 'ui', class: UI, params: {}},
      ],

      edges: [
        {
          source: 'signal', 
          target: 'neurofeedback'
        },
        { 
          source: 'neurofeedback', 
          target: 'brainstorm'
        },
        {
          source: 'brainstorm:neurofeedback', 
          target: 'ui:readout'
        },
      ]
    },
}