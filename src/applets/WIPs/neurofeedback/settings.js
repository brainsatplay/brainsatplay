
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import {Manager} from './Manager'

export const settings = {
    name: "Neurofeedback Studio",
    devices: ["EEG", 'HEG'],
    author: "Garrett Flynn",
    description: "A production-ready neurofeedback application.",
    categories: ["train"],
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
        {id: 'heg', class: brainsatplay.plugins.biosignals.HEG},
        {id: 'manager', class: Manager, params: {}},
        {id: 'ui', class: brainsatplay.plugins.interfaces.UI, params: {}},

      ],

      edges: [
        {
          source: 'eeg:atlas', 
          target: 'manager'
        },
        {
          source: 'heg:atlas', 
          target: 'manager'
        },
        {
          source: 'manager:element', 
          target: 'ui:content'
        }
      ]
    },
}