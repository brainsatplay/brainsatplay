

export const settings = {
    name: "Analyzer",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Anaylze your first Brains@Play data.",
    categories: ["WIP"],
    instructions:"Coming soon...",
    display: {
      production: false
    },

    // App Logic
    graph:
      {
      name: 'benchmark',
      nodes: [
        {name: 'plot', class: brainsatplay.plugins.interfaces.Plot},
        {name: 'data', class: brainsatplay.plugins.utilities.DataManager},
      ],
      edges: [
        {
          source: 'data:latest',
          target: 'plot'
        }
      ]
    },
}
