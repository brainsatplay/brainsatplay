
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import {Manager} from './Manager'
import {Results} from './Results'

export const settings = {
    name: "Experiment Template",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Compare alpha power when eyes closed vs. eyes open.",
    categories: ["learn"],
    instructions:"Coming soon...",
    display: {
      production: false,
      development: true
    },

    // intro: {
    //   title:false
    // },

    // App Logic
    graph:
    {
      nodes: [
        {id: 'eeg', class: brainsatplay.plugins.biosignals.EEG},
        {id: 'manager', class: Manager, params: {}},
        {
          id: 'scheduler', 
          class: brainsatplay.plugins.utilities.Scheduler, 
          params:{
            trialTypes: ['Eyes Open', 'Eyes Closed'],
            trialCount: 2,
            duration: 60,
            interTrialInterval: 2,
            allowConsecutive: false
          }},
        {id: 'data', class: brainsatplay.plugins.utilities.DataManager},
        // {id: 'spacebar', class: brainsatplay.plugins.controls.Event, params: {keycode: 'Space'}},
        // {id: 'results', class: Results},

        // UI
        {id:'ui', class: brainsatplay.plugins.interfaces.UI, params: {
          html: `<div id="experiment"></div>`,
          style: `
          .brainsatplay-ui-container {
            width: 100%;
            height: 100%;
          }

          #experiment {
            width: 100%;
            height: 100%;

            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;

            display: flex;
            align-items: center;
            justify-content: center;
          }
          `
        }}
      ],

      edges: [
        {
          source: 'manager:element', 
          target: 'ui:experiment'
        },


        // Set Up Your Algorithm
        {
          source: 'eeg:atlas', 
          target: 'manager'
        },

        // Schedule an Experiment 
        {
          source: 'scheduler', 
          target: 'manager:schedule'
        },

        // Declare User Commands
        // {
        //   source: 'spacebar', 
        //   target: 'scheduler:update'
        // },
        // {
        //   source: 'spacebar', 
        //   target: 'Test UI:click'
        // },

        // Log App Events
        {
          source: 'manager:data', 
          target: 'data:log'
        },
        // {
        //   source: 'spacebar', 
        //   target: 'data:log'
        // },
        // {
        //   source: 'results:performance', 
        //   target: 'data:log'
        // },
        {
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

        // Show Results
        // {
        //   source: 'scheduler:done', 
        //   target: 'results:show'
        // },
        // {
        //   source: 'results:show', 
        //   target: 'scheduler:reset'
        // },
      ]
    },
}