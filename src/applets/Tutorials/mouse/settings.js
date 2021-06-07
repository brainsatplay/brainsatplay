
// import featureImg from './feature.png'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "BCI Mouse",
    devices: ["EEG"],
    author: "Christopher Coogan + Garrett Flynn",
    description: "Control a mouse with your brain",
    categories: ["Train"],
    // "image":  featureImg,
    instructions:"Coming soon...",
    intro: {
      mode: 'single'
    },
    // App Logic
    graphs: [
      {
      id: 'mygraph',
      nodes: [
        {id: 'up', class: brainsatplay.plugins.inputs.Keyboard, params: {keycode: 'ArrowUp'}},
        {id: 'down', class: brainsatplay.plugins.inputs.Keyboard, params: {keycode: 'ArrowDown'}},
        {id: 'left', class: brainsatplay.plugins.inputs.Keyboard, params: {keycode: 'ArrowLeft'}},
        {id: 'right', class: brainsatplay.plugins.inputs.Keyboard, params: {keycode: 'ArrowRight'}},
        {id: 'spacebar', class: brainsatplay.plugins.inputs.Keyboard, params: {keycode: 'Space'}},
        {id: 'mouse', class: brainsatplay.plugins.outputs.Mouse, params: {}},
      ],
      edges: [
        {
          source: 'up', 
          target: 'mouse:up'
        },
        {
          source: 'down', 
          target: 'mouse:down'
        },
        {
          source: 'left', 
          target: 'mouse:left'
        },
        {
          source: 'right', 
          target: 'mouse:right'
        },
        {
          source: 'spacebar', 
          target: 'mouse:click'
        },
      ]
    }],
}
