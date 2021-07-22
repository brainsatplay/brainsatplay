
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import {Manager} from './Manager'
import {Algorithm} from './Algorithm'

export const settings = {
    name: "Data Science Playground",
    devices: ["EEG"],
    author: "Aya x Garrett",
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
        {id: 'manager', class: Manager, params: {}},
        // {id: 'algorithm', class: Algorithm, params: {}},
      ],

      edges: [
        {
          source: 'eeg:atlas', 
          target: 'manager:data'
        },
      ]
    },
}