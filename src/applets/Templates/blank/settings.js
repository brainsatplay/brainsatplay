import feature from './feature.png'

export const settings = {
    name: "Blank Project",
    devices: ["EEG", "HEG"],
    author: "Brains@Play",
    description: "Start from scratch with a new project using brainsatplay.js!",
    categories: ["Learn"],
    instructions: "",
    image: feature,
    display: {
      production: false,
      development: false
    },

    // App Logic
    graph:
    {
      nodes: [],
      edges: []
    },

    editor: {
      show: true,
      style: `
      position: block;
      z-index: 9;
      `,
  }
}