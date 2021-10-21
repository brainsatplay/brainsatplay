import * as brainsatplay from '../../../libraries/js/brainsatplay'

// Link to Project Assets
import './webbuild/Build/webbuild.wasm'
import './webbuild/Build/webbuild.data'
import * as webconfig from './webbuild/Build/buildconfig'
import * as webbuild from './webbuild/Build/webbuild.loader'

export const settings = {
    name: "P300 Demo",
    devices: ["EEG"],
    author: "Eli Kinney-Lang",
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
        {
          name:'unity', 
          class: brainsatplay.plugins.utilities.Unity, 
          params:{
              webbuild, 
              webconfig,
              onUnityEvent: async function event(ev){

                // Parse Messages from Unity
                if (typeof ev === 'string'){
                  console.log('MESSAGE: ' + ev)
                }

              },
              commands: 
              [
                // {
                //     object: 'GameApplication',
                //     function: 'UpdateAlpha',
                //     type: 'number'
                // }
            ]
          }
        },
        {
          name:'ui', 
          class: brainsatplay.plugins.interfaces.UI
        }
    ],

      edges: [
        {
          source: 'unity:element',
          target: 'ui:content',
        }
      ]
    },
}