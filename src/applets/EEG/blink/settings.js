
// import featureImg from './feature.png'
import {UI} from './UI.js'
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import featureImg from './img/feature.png'

export const settings = {
    name: "Blink",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "A staring contest (with yourself...)",
    categories: ["train"],
    "image":  featureImg,
    instructions:"Coming soon...",
    // intro: {
    //   mode: 'single'
    // },
    // App Logic
    graphs: [
      {
      id: 'mygraph',
      nodes: [
        {id: 'blink', class: brainsatplay.plugins.inputs.Blink, params: {}, loop: true},
        // {id: 'debug', class: brainsatplay.plugins.outputs.Debug, params: {}},
        {id: 'ui', class: UI, params: {}},
      ],
      edges: [
        {
          source: 'blink', 
          target: 'ui'
        }
      ]
    }],
}
