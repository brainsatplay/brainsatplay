
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import {Manager} from './Manager'
import { ERP } from './ERP'

export const settings = {
    name: "P300",
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
        {name: 'eeg', class: brainsatplay.plugins.biosignals.EEG},
        {name: 'manager', class: Manager, params: {}},
        {name: 'erp', class: ERP, params: {}},
        {name: 'ui', class: brainsatplay.plugins.interfaces.UI, params: {

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
          target: 'erp:atlas'
        },

        {
          source: 'manager:timestamp', 
          target: 'erp:timestamp'
        },

        {
          source: 'erp', 
          target: 'manager:select'
        },

        {
          source: 'manager:element', 
          target: 'ui:content'
        },
      ]
    },
}