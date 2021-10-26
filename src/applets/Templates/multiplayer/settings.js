
import {Parser} from './Parser'

export const settings = {
    name: "Multiplayer",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "Get started building a multiplayer neurofeedback app!",
    categories: ["learn"],
    instructions:"Coming soon...",
    display: {
      production: true,
      development: true
    },

    intro: {
      title:false
    },

    // App Logic
    graphs:
    [{
      nodes: [
        {name: 'eeg', class: brainsatplay.plugins.biosignals.EEG},
        {name: 'neurofeedback', class: brainsatplay.plugins.algorithms.Neurofeedback, params: {}},
        {name: 'brainstorm', class: brainsatplay.plugins.networking.Brainstorm, params: {

          onUserConnected: (u) => {
            let parser = settings.graphs[0].nodes.find(n => n.name === 'parser')
            parser.instance._userAdded(u)
          },
      
          onUserDisconnected: (u) => {
            let parser = settings.graphs[0].nodes.find(n => n.name === 'parser')
            parser.instance._userRemoved(u)
          },

        }},
        {name: 'parser', class: Parser, params: {}},
        {name: 'ui', class: brainsatplay.plugins.interfaces.DOM, params: {
          style: `
          .brainsatplay-ui-container {
            width: 100%;
            height: 100%;
          }

          #content {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          `
        }},
      ],

      edges: [
        {
          source: 'eeg:atlas', 
          target: 'neurofeedback'
        },
        { 
          source: 'neurofeedback', 
          target: 'brainstorm'
        },
        {
          source: 'brainstorm:neurofeedback', 
          target: 'parser'
        },
        {
          source: 'parser:element', 
          target: 'ui:content'
        },
      ]
    }],
}