
import {UI} from './UI.js'
import {TaskManager} from './TaskManager.js'
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
        // {id: 'signal', class: brainsatplay.plugins.inputs.Signal},
        // {id: 'My Algorithm', class: brainsatplay.plugins.algorithms.Blink, params: {}},
        {id: 'spacebar', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'Space'}},
        {id: 'task', class: TaskManager, params: {}},
        {id: 'ui', class: UI, params: {}},
      ],
      edges: [
        // {
        //   source: 'signal', 
        //   target: 'My Algorithm'
        // },
        // {
        //   source: 'My Algorithm', 
        //   target: 'ui'
        // },
        {
          source: 'task', 
          target: 'ui'
        },
        {
          source: 'spacebar', 
          target: 'task:events'
        }
      ]
    }],
}
