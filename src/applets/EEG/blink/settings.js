
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
        {id: 'signal', class: brainsatplay.plugins.inputs.Signal, params: {}, loop: true},
        {id: 'blink', class: brainsatplay.plugins.algorithms.Blink, params: {}},
        // {id: 'debug', class: brainsatplay.plugins.outputs.Debug, params: {}},
        {id: 'ui', class: UI, params: {}},
      ],
      edges: [
        {
          source: 'signal', 
          target: 'blink:left'
        },
        {
          source: 'signal', 
          target: 'blink:right'
        },
        {
          source: 'blink:left', 
          target: 'ui:left'
        }, 
        {
          source: 'blink:right', 
          target: 'ui:right'
        }
      ]
    }],
}
