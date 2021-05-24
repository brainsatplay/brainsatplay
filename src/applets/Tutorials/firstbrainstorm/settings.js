
// import featureImg from './feature.png'
import {Coherence} from '../../../libraries/js/src/plugins/Coherence'
import {UI} from './UI'
import {Keyboard} from '../../../libraries/js/src/plugins/Keyboard'
import {Debug} from '../../../libraries/js/src/plugins/Debug'

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
        {id: 'spacebar', class: Keyboard, params: {key: 'Space'}, stream: true},
        {id: 'coherence', class: Coherence, params: {}, loop: true, stream: true}, 
        {id: 'ui', class: UI, params: {toggle: 'spacebar'}},
        {id: 'debug', class: Debug, params: {}},
      ],
      edges: [
        // {
        //   source: 'spacebar', 
        //   target: 'debug'
        // },{
        //   source: 'coherence', 
        //   target: 'debug'
        // }
      ]
    }],
}
