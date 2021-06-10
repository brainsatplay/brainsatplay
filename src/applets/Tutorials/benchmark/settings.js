
import {Plot} from './Plot'
import {DataManager} from './DataManager'

import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "Benchmarker",
    devices: ["EEG"],
    author: "Brains@Play",
    description: "Benchmark your first Brains@Play plugin.",
    categories: ["tutorial"],
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
        // {id: 'signal', class: brainsatplay.plugins.inputs.Signal},
        // {id: 'My Algorithm', class: brainsatplay.plugins.algorithms.Blink},
        // {id: 'scheduler', class: Scheduler, params:{}},
        // {id: 'Train UI', class: Train},
        {id: 'data', class: DataManager},
        // {id: 'spacebar', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'Space'}},
        // {id: 'Test UI', class: Test},
      ],
      edges: [
        {
          source: 'data:latest',
          target: 'plot'
        }
      ]
    },
}
