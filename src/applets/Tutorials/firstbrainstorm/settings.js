
// import featureImg from './feature.png'
import {UI} from './UI'
import {Keyboard} from '../../../libraries/js/src/plugins/input/Keyboard'
import {Signal} from '../../../libraries/js/src/plugins/input/Signal'
import {Neurofeedback} from '../../../libraries/js/src/plugins/algorithms/Neurofeedback'
// import {Transform} from '../../../libraries/js/src/plugins/algorithms/Transform'

export const settings = {
    name: "My First Brainstorm",
    devices: ["EEG"],
    author: "Me",
    description: "This is my first brainstorm.",
    categories: ["tutorial","brainstorm"],
    // "image":  featureImg,
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
        {id: 'spacebar', class: Keyboard, params: {key: 'Space'}},
        {id: 'signal', class: Signal, loop: true},
        {id: 'neurofeedback', class: Neurofeedback, params: {}},
        // {id: 'transform', class: Transform, params: {}},
        {id: 'ui', class: UI, params: {}},
      ],
      edges: [
        {
          source: 'signal', 
          target: 'neurofeedback'
        },
        {
          source: 'spacebar:brainstorm', 
          target: 'ui:color'
        },
        {
          source: 'neurofeedback:brainstorm', 
          target: 'ui:readout'
        }
      ]
    }],
}
