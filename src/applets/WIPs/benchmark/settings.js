
import {Train} from './Train'
import {DataManager} from '../analyzer/DataManager'
import {Test} from './Test'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "Benchmarker",
    devices: ["EEG"],
    author: "Brains@Play",
    description: "Benchmark your first Brains@Play plugin.",
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
        {id: 'signal', class: brainsatplay.plugins.inputs.Signal},
        {id: 'My Algorithm', class: brainsatplay.plugins.algorithms.Blink},
        {id: 'scheduler', class: class: brainsatplay.plugins.utilities.Scheduler, params:{}},
        {id: 'Train UI', class: Train},
        {id: 'data', class: DataManager},
        {id: 'spacebar', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'Space'}},
        {id: 'Test UI', class: Test},
      ],
      edges: [

        // Set Up Your Algorithm
        {
          source: 'signal', 
          target: 'My Algorithm'
        },
        // {
        //   source: 'My Algorithm', 
        //   target: 'Train UI'
        // },

        // Schedule an Experiment 
        {
          source: 'scheduler', 
          target: 'Train UI'
        },

        // Declare User Commands
        {
          source: 'spacebar', 
          target: 'scheduler:update'
        },
        {
          source: 'spacebar', 
          target: 'Test UI:click'
        },

        // Log App Events
        {
          source: 'spacebar', 
          target: 'data'
        },
        {
          source: 'Test UI:performance', 
          target: 'data'
        },{
          source: 'scheduler:state', 
          target: 'data:log'
        },

        // Trigger Data Events 
        // {
        //   source: 'scheduler:done', 
        //   target: 'data:get'
        // },
        {
          source: 'scheduler:done', 
          target: 'data:csv'
        },

        // Test your Model
        {
          source: 'scheduler:done', 
          target: 'Test UI:show'
        },{
          source: 'Test UI:show', 
          target: 'scheduler:reset'
        },
      ]
    },
}
