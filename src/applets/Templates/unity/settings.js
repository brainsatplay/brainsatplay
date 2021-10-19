import * as brainsatplay from '../../../libraries/js/brainsatplay'
import {Unity} from './unityUtils/Unity'


// MUST IMPORT ALL THE FILES FROM BUILD AND TEMPLATEDATA
// import * as webbuild from './webbuild.loader' // Loader may be univeral

export const settings = {
    name: "Unity Template",
    devices: ["EEG", "HEG"],
    author: "Juris Zebneckis",
    description: "",
    categories: ["WIP"],
    instructions:"",
    display: {
      production: true,
      development: true
    },
    
    // App Logic
    graph:
    {
      nodes: [
        // {name:'eeg', class: brainsatplay.plugins.biosignals.EEG},
        // {name:'neurofeedback', class: brainsatplay.plugins.algorithms.Neurofeedback},
        {name:'left', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowLeft'}},
        {name:'sine', class: brainsatplay.plugins.data.Sine},
        {
          name:'unity', 
          class: Unity, 
          params:{
              commands: 
              [
                {
                    object: 'GameApplication',
                    function: 'UpdateAlpha',
                    type: 'number'
                },
                {
                    object: 'GameApplication',
                    function: 'UpdateAlphaBeta',
                    type: 'number'
                },
                {
                    object: 'GameApplication',
                    function: 'UpdateAlphaTheta',
                    type: 'number'
                },
                {
                    object: 'GameApplication',
                    function: 'UpdateCoherence',
                    type: 'number'
                },
                {
                    object: 'GameApplication',
                    function: 'UpdateFocus',
                    type: 'number'
                },
                {
                    object: 'GameApplication',
                    function: 'UpdateThetaBeta',
                    type: 'number'
                },
                {
                    object: 'GameApplication',
                    function: 'UpdateBlink',
                    type: 'boolean'
                },
                {
                    object: 'GameApplication',
                    function: 'UpdateO1',
                    type: 'number'
                }
            ]
              // [{
              //   object: 'GameApplication',
              //   function: 'updateData',
              //   type: 'number'
              // }, {
              //   object: 'GameApplication',
              //   function: 'updateBlink', // or just blink
              //   type: 'boolean'
              // }]
          }
        },
        {
          name:'ui', 
          class: brainsatplay.plugins.interfaces.UI
        }
    ],

      edges: [

        // BRAIN
        // {
        //   source: 'eeg:atlas',
        //   target: 'neurofeedback',
        // },
        // {
        //   source: 'neurofeedback',
        //   target: 'unity:updateData',
        // },


        // TEST
          {
            source: 'left',
            target: 'unity:UpdateBlink',
          },
        {
          source: 'sine',
          target: 'unity:UpdateAlpha',
        },
        {
          source: 'unity:element',
          target: 'ui:content',
        }
      ]
    },
}