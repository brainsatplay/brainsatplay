
// import featureImg from './feature.png'
import {Coherence} from '../../../libraries/js/src/plugins/Coherence'
import {UI} from './UI'
import {Debug} from '../../../libraries/js/src/plugins/Debug'


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
        {id: 'coherence', class: Coherence, params: {}, loop: true, stream: true}, 
        {id: 'ui', class: UI, params: {}},
        {id: 'debug', class: Debug, params: {}},
      ],
      edges: [
        // {
        //   source: 'coherence', 
        //   target: 'debug'
        // }
      ]
    }],
}
