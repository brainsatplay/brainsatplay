
import {UI} from './UI'
import * as brainsatplay from '../../../libraries/js/brainsatplay'


export const settings = {
    name: "My First Brainstorm",
    devices: ["EEG"],
    author: "Me",
    description: "This is my first brainstorm.",
    categories: ["tutorial","brainstorm"],
    instructions:"Coming soon...",

    // UI Presets
    intro: {
      subtitle: 'A Simple Networked Game',
    },

    // App Logic
    graphs: [
      {
      id: 'mygraph',
      nodes: [
        {id: 'spacebar', class: brainsatplay.plugins.inputs.Keyboard, params: {key: 'Space'}},
        {id: 'signal', class: brainsatplay.plugins.inputs.Signal},
        {id: 'neurofeedback', class: brainsatplay.plugins.algorithms.Neurofeedback, params: {}},
        {id: 'ui', class: UI, params: {}},
        {id: 'brainstorm', class: brainsatplay.plugins.utilities.Brainstorm, params: {}},
      ],
      edges: [
        {
          source: 'signal', 
          target: 'neurofeedback'
        },
        {
          source: 'spacebar', 
          target: 'brainstorm'
        },
        {
          source: 'neurofeedback', 
          target: 'brainstorm'
        },
        {
          source: 'brainstorm:spacebar', 
          target: 'ui:color'
        },
        {
          source: 'brainstorm:neurofeedback', 
          target: 'ui:readout'
        }
      ]
    }],
}
