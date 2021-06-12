
import {UI} from './UI.js'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "Neosensory Playground",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Work with the Neosensory Buzz.",
    categories: ["tutorial"],
    instructions:"Coming soon...",
    // intro: {
    //   mode: 'single'
    // },
    
    // App Logic
    graph:
      {
      nodes: [
        {id: 'ui', class: UI, params: {}},
        {id: 'buzz', class: brainsatplay.plugins.outputs.Buzz},
        {id: 'spacebar', class: brainsatplay.plugins.inputs.Event,params:{keycode:"Space"}},
  ,     {id: 'up', class: brainsatplay.plugins.inputs.Event,params:{keycode:"ArrowUp"}},
      ],
      edges: [
        {
          source: 'up', 
          target: 'buzz:leds'
        },
        {
          source: 'spacebar', 
          target: 'buzz:punch'
        },
        {
          source: 'buzz:status', 
          target: 'ui'
        }
      ]
    },
}
