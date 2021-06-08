
import {Train} from './Train'
import {Scheduler} from './Scheduler.js'
import {DataManager} from './DataManager.js'
import {Test} from './Test.js'
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
        {id: 'Train', class: Train, params: {}},
        {id: 'data', class: DataManager, params: {}},
        {id: 'spacebar', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'Space'}},
        {id: 'Test', class: Test, params: {}},
      ],
      edges: [

        // Set Up Your Algorithm
        {
          source: 'signal', 
          target: 'My Algorithm'
        },
        {
          source: 'My Algorithm', 
          target: 'Train'
        },

        // Schedule an Experiment 
        {
          source: 'scheduler', 
          target: 'Train'
        },

        // Declare User Commands
        {
          source: 'spacebar', 
          target: 'Test:click'
        },

        // Log App Events
        {
          source: 'spacebar', 
          target: 'data'
        },
        {
          source: 'Test:performance', 
          target: 'data'
        },{
          source: 'scheduler:state', 
          target: 'data:log'
        },

        // Trigger Data Events 
        {
          source: 'scheduler:done', 
          target: 'data:get'
        },
        {
          source: 'scheduler:done', 
          target: 'data:csv'
        },

        // Test your Model
        {
          source: 'scheduler:done', 
          target: 'Test:show'
        },
      ]
    }],
}
