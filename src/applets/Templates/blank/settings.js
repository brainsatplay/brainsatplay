export const settings = {
    name: "Blank Project",
    devices: ["EEG", "HEG"],
    author: "",
    description: "",
    categories: ["WIP"],
    instructions:"",
    display: {
      production: false,
      development: false
    },

    intro: {
      title: false,
      mode: 'solo', // 'solo', 'multiplayer'
      login: null,
      domain: null,
      session: null,
      spectating: false,
  },

    // App Logic
    graph:
    {
      nodes: [],

      edges: []
    },
}