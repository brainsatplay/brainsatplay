
import {Studio} from './Studio.js'
import feature from './feature.png'
import * as brainsatplay from './../../../libraries/js/brainsatplay'

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

    editor: {
      create: false
    },

    // App Logic
    graph:
    {
      nodes: [
        {id: 'studio', class: Studio, params: {}},
        {id: 'ui', class: brainsatplay.plugins.interfaces.UI, params: {}},
      ],

      edges: [
        {source: 'studio:element', target: 'ui:content'}
      ]
    },
}