
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
        {id: 'sphere', class: brainsatplay.plugins.utilities.Sphere},
        {id: 'scene', class: brainsatplay.plugins.outputs.Scene},
      ],
      edges: [

        // Draw Sphere to Scene
        {
          source: 'sphere:draw', 
          target: 'scene:draw'
        },

        // Draw light to Scene
        {
          source: 'light:draw', 
          target: 'scene:draw'
        },

      ]
    },
}
