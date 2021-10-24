
import {Manager} from './Manager'

export const settings = {
    name: "SSVEP",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Select flashing objects with your brain.",
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
        {name: 'eeg', class: brainsatplay.plugins.biosignals.EEG},
        {name: 'manager', class: Manager, params: {}},
         // UI
         {name:'ui', class: brainsatplay.plugins.interfaces.UI, params: {
          html: `<div id="content"></div>`,
          style: `
          .brainsatplay-ui-container {
            width: 100%;
            height: 100%;
          }

          #content {
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
          target: 'ui:content'
        },


        // Set Up Your Algorithm
        {
          source: 'eeg:atlas', 
          target: 'manager'
        },
      ]
    },
}