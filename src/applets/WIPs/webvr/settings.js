
import {UI} from './UI.js'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "WebXR Playground",
    devices: ["EEG", "HEG"],
    author: "Jack of Hearts",
    description: "Tea",
    categories: ["WIP"],
    instructions:"Coming soon...",
    // intro: {
    //   mode: 'single'
    // },
    
    // App Logic
    graph:
      {
      nodes: [
        {id: 'light', class: brainsatplay.plugins.utilities.Light},
        {id: 'material', class: brainsatplay.plugins.utilities.Material},
        {id: 'geometry', class: brainsatplay.plugins.utilities.Geometry},
        {id: 'sphere', class: brainsatplay.plugins.utilities.Mesh},
        {id: 'scene', class: brainsatplay.plugins.outputs.Scene},
      ],
      edges: [

        // Draw Sphere to Scene
        {
          source: 'geometry', 
          target: 'sphere:geometry'
        },
        {
          source: 'material', 
          target: 'sphere:material'
        },
        {
          source: 'sphere:add', 
          target: 'scene:add'
        },

        // Draw light to Scene
        {
          source: 'light:add', 
          target: 'scene:add'
        },

      ]
    },
}
