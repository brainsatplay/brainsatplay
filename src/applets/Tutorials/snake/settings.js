
// import featureImg from './feature.png'
import {UI} from './UI.js'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "BCI Snake",
    devices: ["EEG"],
    author: "Christopher Coogan + Garrett Flynn",
    description: "Snake + BCI2000.",
    categories: ["tutorial"],
    // "image":  featureImg,
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
        {id: 'signal', class: brainsatplay.plugins.Signal, loop: true},
      ],
      edges: [
        {
          source: 'signal', 
          target: 'ui'
        }
      ]
    }],
}
