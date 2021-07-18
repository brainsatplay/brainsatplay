
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import {Manager} from './Manager'
import {Algorithm} from './Algorithm'

export const settings = {
    name: "EEG Template",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Get started working with real-time EEG data!",
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
        // {id: 'neurofeedback', class: brainsatplay.plugins.algorithms.Neurofeedback, params: {}},
        // {id: 'brainstorm', class: brainsatplay.plugins.networking.Brainstorm, params: {}},
        {id: 'manager', class: Manager, params: {}},
        {id: 'algorithm', class: Algorithm, params: {}},
      ],

      edges: [
        {
          source: 'eeg:atlas', 
          target: 'manager:data'
          // target: 'neurofeedback'
        },
        // { 
        //   source: 'neurofeedback', 
        //   target: 'ui:readout'
        // },
        // { 
        //   source: 'neurofeedback', 
        //   target: 'brainstorm'
        // },
        // {
        //   source: 'brainstorm:neurofeedback', 
        //   target: 'ui:readout'
        // },
      ]
    },
}