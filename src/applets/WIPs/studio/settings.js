
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import {UI} from './UI.js'
export const settings = {
    name: "Brains@Play Studio",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Design your own application.",
    categories: ["UI"],
    instructions:"Coming soon...",
    display: {
      production: false
    },

    intro: {
      title: false,
      mode: 'multi'
    },

    // App Logic
    graph:
    {
      nodes: [
        {id: 'spacebar', class: brainsatplay.plugins.inputs.Event, params: {key: 'Space'}},
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
          source: 'spacebar', 
          target: 'brainstorm:spacebar'
        },
        // { 
        //   source: 'neurofeedback', 
        //   target: 'brainstorm:neurofeedback'
        // },
        {
          source: 'brainstorm:spacebar', 
          target: 'ui:color'
        },
        {
          source: 'brainstorm:spacebar', 
          target: 'ui:readout'
        },
        // {
        //   source: 'spacebar', 
        //   target: 'ui:color'
        // },
        // {
        //   source: 'neurofeedback', 
        //   target: 'ui:readout'
        // }
      ]
    },
}