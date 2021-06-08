
import {UI} from './UI.js'
import {Scheduler} from './Scheduler.js'
import {DataManager} from './DataManager.js'
import {TimeTrainer} from './TimeTrainer.js'
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
    graphs: [
      {
      id: 'benchmark',
      nodes: [
        {id: 'signal', class: brainsatplay.plugins.inputs.Signal},
        {id: 'My Algorithm', class: brainsatplay.plugins.algorithms.Blink, params: {}},
        {id: 'scheduler', class: Scheduler, params: {}},
        {id: 'ui', class: UI, params: {}},
        {id: 'data', class: DataManager, params: {}},
        // {id: 'spacebar', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'Space'}},
        // {id: 'ui', class: TimeTrainer, params: {}},
      ],
      edges: [
        {
          source: 'signal', 
          target: 'My Algorithm'
        },
        {
          source: 'My Algorithm', 
          target: 'ui'
        },
        {
          source: 'scheduler', 
          target: 'ui'
        },
        {
          source: 'scheduler:state', 
          target: 'data:log'
        },
        // {
        //   source: 'spacebar', 
        //   target: 'data'
        // },
        // {
        //   source: 'spacebar', 
        //   target: 'ui:click'
        // },
        // {
        //   source: 'ui:click', 
        //   target: 'data'
        // },
      ]
    }],
}
