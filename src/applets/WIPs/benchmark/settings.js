
import {Train} from './Train'
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
        {id: 'eeg', class: brainsatplay.plugins.biosignals.EEG},
        {id: 'My Algorithm', class: brainsatplay.plugins.algorithms.Blink},
        {id: 'scheduler', class: brainsatplay.plugins.utilities.Scheduler, params:{interTrialInterval: 2}},
        {id: 'Train UI', class: Train},
        {id: 'data', class: brainsatplay.plugins.utilities.DataManager},
        {id: 'spacebar', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'Space'}},
        {id: 'motorimagery', class: brainsatplay.plugins.models.LDA},
        {id: 'Test UI', class: Test},
      ],
      edges: [

        // Set Up Your Algorithm
        {
          source: 'eeg:data', 
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

        // Train Model
        {
          source: 'data:latest',
          target: 'motorimagery'
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
