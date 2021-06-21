
import {Plot} from './Plot'
import {DataManager} from './DataManager'

import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "Analyzer",
    devices: ["EEG"],
    author: "Brains@Play",
    description: "Anaylze your first Brains@Play data.",
    categories: ["WIP"],
    instructions:"Coming soon...",
    display: {
      production: false
    },

    // App Logic
    graph:
      {
      id: 'benchmark',
      nodes: [
        {id: 'plot', class: Plot},
        {id: 'data', class: DataManager},
      ],
      edges: [
        {
          source: 'data:latest',
          target: 'plot'
        }
      ]
    },
}
