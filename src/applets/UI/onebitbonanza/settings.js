
import {UI} from './UI.js'
// import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "One Bit Bonanza",
    author: "Garrett Flynn",
    devices: ["EEG","HEG"],
    description: "Play a new low-bandwidth game every few seconds!",
    categories: ["UI"],
    instructions:"Coming soon...",
    display: {
      development: false,
      production: false
    },
    
    // App Logic
    graphs: [
      {
      id: 'mygraph',
      nodes: [
        {id: 'ui', class: UI, params: {}}
      ],
      edges: [
        // {
        //   source: 'signal', 
        //   target: 'neurofeedback'
        // },
        // {
        //   source: 'neurofeedback', 
        //   target: 'ui'
        // }
      ]
    }],
}
