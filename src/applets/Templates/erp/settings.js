
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import {Manager} from './Manager'

export const settings = {
    name: "ERP Template",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Recognize event-related potentials on the browser",
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
        {id: 'ui', class: brainsatplay.plugins.interfaces.UI, params: {

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

        }},

      ],

      edges: [
        {
          source: 'eeg:atlas', 
          target: 'manager:data'
        },
        {
          source: 'manager:element', 
          target: 'ui:content'
        },
      ]
    },
}