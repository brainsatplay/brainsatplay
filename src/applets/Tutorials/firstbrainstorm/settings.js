
// import featureImg from './feature.png'
import {Coherence} from '../../../libraries/js/src/nodes/Coherence'
import {UI} from './UI'
import {Spacebar} from '../../../libraries/js/src/nodes/Spacebar'
import {Debug} from '../../../libraries/js/src/nodes/Debug'
import {Add} from '../../../libraries/js/src/nodes/Add'

export const settings = {
    name: "My First Brainstorm",
    type: 'Application',
    devices: ["EEG"],
    author: "Me",
    description: "This is my first brainstorm.",
    categories: ["tutorial","brainstorm"],
    module: "Applet",
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
        {id: 'spacebar', class: Spacebar, params: {}, stream: true}, 
        {id: 'coherence', class: Coherence, params: {}, stream: true, loop: true}, 
        {id: 'ui', class: UI, params: {}},
        {id: 'debug', class: Debug, params: {}},
        {id:'add', class:Add, params: {}}
      ],
      edges: [
        // {
        //   source: 'spacebar', 
        //   target: 'add'
        // },{
        //   source: 'add', 
        //   target: 'debug'
        // },
        // {
        //   source: 'coherence', 
        //   target: 'debug'
        // }
      ]
    }],
}
