
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import {UI} from './UI.js.js'

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

    // App Logic
    graph:
      {
      nodes: [
        {id: 'signal', class: brainsatplay.plugins.inputs.Signal, params: {}},
        {id: 'debug', class: brainsatplay.plugins.outputs.Debug, params: {}},
      ],
      edges: [{
        source: 'signal',
        target: 'debug'
      }]
    },
}
