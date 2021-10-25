
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
        {name: 'heg', class: brainsatplay.plugins.biosignals.HEG},
        {name: 'buzz', class: brainsatplay.plugins.haptics.Buzz},

        {name: 'manager', class: Manager, params: {}},

        {name: 'ui', class: brainsatplay.plugins.interfaces.DOM},
      ],

      edges: [
        {
          source: 'heg:atlas', 
          target: 'manager:data'
        },
        {
          source: 'manager:beat', 
          target: 'buzz:motors'
        },
        {
          source: 'manager:element', 
          target: 'ui:content'
        },
      ]
    },
}