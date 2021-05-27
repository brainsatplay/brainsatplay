
// import featureImg from './feature.png'
import {UI} from './UI'
import {Signal} from '../../../libraries/js/src/plugins/input/Signal'
import {Neurofeedback} from '../../../libraries/js/src/plugins/algorithms/Neurofeedback'


export const settings = {
    name: "My First Applet",
    devices: ["EEG"],
    author: "Me",
    description: "This is my first applet.",
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
        {id: 'signal', class: Signal, loop: true},
        {id: 'neurofeedback', class: Neurofeedback, params: {}},
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
