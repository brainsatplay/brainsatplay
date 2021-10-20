
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
      show: false,
      create: false
    },

    // App Logic
    graph:
    {
      nodes: [
        {name: 'studio', class: Studio, params: {}},
        {name: 'ui', class: brainsatplay.plugins.interfaces.UI, params: {}},
      ],

      edges: [
        {source: 'studio:element', target: 'ui:content'}
      ]
    },
}