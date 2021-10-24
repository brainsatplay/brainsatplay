

export const settings = {
    name: "BCI Mouse",
    devices: ["EEG"],
    author: "Christopher Coogan + Garrett Flynn",
    description: "Control a mouse with your brain",
    categories: ["UI"],
    // "image":  featureImg,
    instructions:"Coming soon...",
    display: {
      production: false
    },
    // App Logic
    graph:
      {
      nodes: [
        {name: 'up', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowUp'}},
        {name: 'down', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowDown'}},
        {name: 'left', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowLeft'}},
        {name: 'right', class: brainsatplay.plugins.controls.Event, params: {keycode: 'ArrowRight'}},
        {name: 'click', class: brainsatplay.plugins.controls.Event, params: {keycode: 'Space'}},
        {name: 'move', class: brainsatplay.plugins.utilities.Move},
        {name: 'cursor', class: brainsatplay.plugins.interfaces.Cursor, params: {}},
      ],
      edges: [

        // Up
        {
          source: 'up', 
          target: 'move:up'
        },

        // Down
        {
          source: 'down', 
          target: 'move:down'
        },

        // Left
        {
          source: 'left', 
          target: 'move:left'
        },

        // Right
        {
          source: 'right', 
          target: 'move:right'
        },

        // X and Y
        {
          source: 'move:dx', 
          target: 'cursor:dx'
        },

        {
          source: 'move:dy', 
          target: 'cursor:dy'
        },

        {
          source: 'click', 
          target: 'cursor:click'
        },
      ]
    },
}
