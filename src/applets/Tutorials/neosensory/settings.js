
import {UI} from './UI.js'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "Neosensory Playground",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Work with the Neosensory Buzz.",
    categories: ["tutorial"],
    instructions:"Coming soon...",
    // intro: {
    //   mode: 'single'
    // },
    
    // App Logic
    graphs: [
      {
      id: 'mygraph',
      nodes: [
        {id: 'ui', class: UI, params: {}},
        {id: 'buzz', class: brainsatplay.plugins.outputs.Buzz},
        {id: 'signal', class: brainsatplay.plugins.inputs.Signal},
        {id: 'neurofeedback', class: brainsatplay.plugins.algorithms.Neurofeedback},
      ],
      edges: [
        {
          source: 'signal', 
          target: 'neurofeedback'
        },
        {
          source: 'neurofeedback', 
          target: 'buzz:leds'
        },
        {
          source: 'signal:fft', 
          target: 'buzz:motors'
        },
        {
          source: 'buzz:status', 
          target: 'ui'
        }
      ]
    }],
}
