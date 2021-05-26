
// import featureImg from './feature.png'
import {Coherence} from '../../../libraries/js/src/plugins/Coherence'
import {UI} from './UI'
import {Debug} from '../../../libraries/js/src/plugins/Debug'
import {Signal} from '../../../libraries/js/src/plugins/Signal'
import {MathPlugin} from '../../../libraries/js/src/plugins/Math'


let id = String(Math.floor(Math.random()*1000000))

export const settings = {
    name: "My First Applet",
    type: 'Application',
    devices: ["EEG"],
    author: "Me",
    description: "This is my first applet.",
    categories: ["tutorial"],
    module: "Applet",
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
        {id: 'signal', class: Signal, params: {}, loop: true},
        {id: 'math', class: MathPlugin, params: {}},
      ],
      edges: [
        {
          source: 'signal', 
          target: 'math'
        },
        {
          source: 'math', 
          target: 'ui'
        }
      ]
    }],
}
