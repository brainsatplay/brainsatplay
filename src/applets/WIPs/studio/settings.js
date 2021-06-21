
import {Studio} from './Studio.js'
import feature from './feature.png'

export const settings = {
    name: "Brains@Play Studio",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Design your own application.",
    categories: ["UI"],
    instructions:"Coming soon...",
    image: feature,

    display: {
      production: false,
      development: false
    },

    // App Logic
    graph:
    {
      nodes: [
        {id: 'studio', class: Studio, params: {}},
      ],

      edges: []
    },
}