
import {Plot} from '../analyzer/Plot'
import {DataManager} from '../analyzer/DataManager'

import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "BuckleUp",
    devices: ["EEG"],
    author: "Brains@Play",
    description: "Fitbit Data to B@P.",
    categories: ["tutorial"],
    instructions:"Coming soon...",
    display: {
      production: false
    },

    // App Logic
    graph:
      {
      nodes: [
        {id: 'plot', class: Plot},
        {id: 'data', class: DataManager},
      ],
      edges: [
        {
          source: 'data:fitbit',
          target: 'plot'
        }
      ]
    },
}
