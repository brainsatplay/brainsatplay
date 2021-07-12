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
      nodes: [{id:'player', class: brainsatplay.plugins.interfaces.Video}],
      edges: []
    },
}