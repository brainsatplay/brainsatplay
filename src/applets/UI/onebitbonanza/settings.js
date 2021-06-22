
import {UI} from './UI.js'
// import * as brainsatplay from '../../../libraries/js/brainsatplay'
import feature from './feature.jpg'

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
    image: feature,
    
    // App Logic
    graph:
      {
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
    },
}
