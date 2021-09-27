
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import {Manager} from './Manager'

export const settings = {
    name: "Pulse Circle",
    devices: ["HEG"],
    author: "Garrett Flynn",
    description: "Pulse the circle with your heartbeat!",
    categories: ["visualize"],
    instructions:"Coming soon...",
    display: {
      production: true,
      development: true
    },

    // intro: {
    //   title:false
    // },

    // App Logic
    graph:
    {
      nodes: [
        {id: 'heg', class: brainsatplay.plugins.biosignals.HEG},
        {id: 'manager', class: Manager, params: {}},

        {id: 'ui', class: brainsatplay.plugins.interfaces.UI},
      ],

      edges: [
        {
          source: 'heg:atlas', 
          target: 'manager:data'
        },
        {
          source: 'manager:element', 
          target: 'ui:content'
        },
      ]
    },
}