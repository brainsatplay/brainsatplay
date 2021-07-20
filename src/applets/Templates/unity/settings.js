import * as brainsatplay from '../../../libraries/js/brainsatplay'

// import * as webbuild from './webbuild.loader'

export const settings = {
    name: "Unity Template",
    devices: ["EEG", "HEG"],
    author: "Juris Zebneckis",
    description: "",
    categories: ["WIP"],
    instructions:"",
    display: {
      production: false,
      development: true
    },
    
    // App Logic
    graph:
    {
      nodes: [
        {id:'eeg', class: brainsatplay.plugins.biosignals.EEG},
        {id:'neurofeedback', class: brainsatplay.plugins.algorithms.Neurofeedback},
        {
          id:'unity', 
          class: brainsatplay.plugins.interfaces.Unity, 
          // params:{webbuild}
        },
        {
          id:'ui', 
          class: brainsatplay.plugins.interfaces.UI
        }
    ],

      edges: [
        {
          source: 'eeg:atlas',
          target: 'neurofeedback',
        },
        {
          source: 'neurofeedback',
          target: 'unity',
        },
        {
          source: 'unity:element',
          target: 'ui:content',
        }
      ]
    },
}