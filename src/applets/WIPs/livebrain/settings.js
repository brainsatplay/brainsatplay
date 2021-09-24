
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import {Manager} from './Manager'

import {brainpoints} from './visbrain'

export const settings = {
    name: "3D Brain",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "A responsive 3D brain in JavaScript.",
    categories: ["learn"],
    instructions:"Coming soon...",
    display: {
      production: false,
      development: true
    },

    // intro: {
    //   title:false
    // },

    // App Logic
    graph:
    {
      nodes: [
        {id: 'eeg', class: brainsatplay.plugins.biosignals.EEG},
        {id: 'manager', class: Manager, params: {model: brainpoints, resolution: 0.5}},
        {id: 'ui', class: brainsatplay.plugins.interfaces.UI, params: {}},
      ],

      edges: [
        {
          source: 'eeg:atlas', 
          target: 'manager:data'
        },

        {
          source: 'manager:element', 
          target: 'ui:content'
        },
      ]
    },
}