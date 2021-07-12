import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "CineMatic",
    devices: ["EEG", "HEG"],
    author: "Brains@Play",
    description: "Cut movies together based on brain data",
    categories: ["WIP"],
    instructions: "",
    display: {
      production: false,
      development: true
    },
    // App Logic
    graph:
    {
      nodes: [
        {id:'player', class: brainsatplay.plugins.interfaces.Video},
        {id:'ui', class: brainsatplay.plugins.interfaces.UI, params: {
          html: `<div id="vidContainer" class="video-container"></div>`,
          style: `
          .brainsatplay-ui-container {
            width: 100%;
            height: 100%;
          }
          
          .video-container {
            width: 100%;
            height: 100%;
          }
          `
        }}

      ],
      edges: [{
        source: 'player:element',
        target: 'ui:vidContainer'
      }]
    },
}