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
          source: 'unity:element',
          target: 'ui:content',
        }
      ]
    },
}