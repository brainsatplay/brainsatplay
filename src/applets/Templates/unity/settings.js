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
        {name:'eeg', class: brainsatplay.plugins.biosignals.EEG},
        {name:'neurofeedback', class: brainsatplay.plugins.algorithms.Neurofeedback, params: {metric: 'Focus'}},
        {name:'blink', class: brainsatplay.plugins.controls.Event},
        {
          name:'unity', 
          class: Unity, 
          params:{
              onUnityEvent: async function event(ev){

                // Parse Messages from Unity
                if (typeof ev === 'string'){
                  console.log('MESSAGE: ' + ev)
                } else {
                  let blink = this.node.parent.getNode('blink')
                  await blink.update('default', {value: true})
                  await blink.update('default', {value: false})
                }

              },
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
          }
        },
        {
          name:'ui', 
          class: brainsatplay.plugins.interfaces.UI
        }
    ],

      edges: [

        // BRAIN
        {
          source: 'eeg:atlas',
          target: 'neurofeedback',
        },
        {
          source: 'neurofeedback',
          target: 'unity:UpdateFocus',
        },

          {
            source: 'blink',
            target: 'unity:UpdateBlink',
          },

        {
          source: 'unity:element',
          target: 'ui:content',
        }
      ]
    },
}