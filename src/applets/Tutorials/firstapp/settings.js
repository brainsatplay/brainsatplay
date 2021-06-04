
import {UI} from './UI.js'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "My First Applet",
    devices: ["EEG"],
    author: "Me",
    description: "This is my first applet.",
    categories: ["tutorial"],
    instructions:"Coming soon...",
    intro: {
      mode: 'single'
    },
    
    // App Logic
    graphs: [
      {
      id: 'mygraph',
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
    }],
}
