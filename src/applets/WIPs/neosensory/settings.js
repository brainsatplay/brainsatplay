
import {UI} from './UI.js'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "Neosensory Playground",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Work with the Neosensory Buzz.",
    categories: ["tutorial"],
    instructions:"Coming soon...",
    display: {
      production: false
    },
    // intro: {
    //   mode: 'single'
    // },
    
    // App Logic
    graph:
      {
      nodes: [
        {id: 'ui', class: UI, params: {}},
        {id: 'buzz', class: brainsatplay.plugins.outputs.Buzz},
        {id: 'spacebar', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'Space'}},
        {id: 'up', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'ArrowRight'}},
        // {id: 'enter', class: brainsatplay.plugins.inputs.Event, params: {keycode: 'Enter'}},
      ],
      edges: [

        // Light up LEDs with Up Arrow
        {
          source: 'up', 
          target: 'buzz:leds'
        },
        
        // Punch your Wrist with Spacebar
        {
          source: 'spacebar', 
          target: 'buzz:punch'
        },

        // Or Punch your Wrist with the Button
        {
          source: 'ui:button', 
          target: 'buzz:punch'
        },

        // Show Device State on the UI
        {
          source: 'buzz:status', 
          target: 'ui'
        },

        // BRAIN STUFF
        // {
        //   source: 'signal', 
        //   target: 'neurofeedback'
        // },
        // {
        //   source: 'neurofeedback', 
        //   target: 'buzz:leds'
        // },
        // {
        //   source: 'signal:fft', 
        //   target: 'buzz:motors'
        // },
      ]
    },
}
