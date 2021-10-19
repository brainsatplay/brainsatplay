import {AppletBrowser} from '../../../libraries/js/src/ui/AppletBrowser'
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "Applet Browser",
    author: "Garrett Flynn",
    devices: ["EEG","HEG"],
    description: "Choose an applet.",
    categories: ["UI"],
    instructions:"Coming soon...",
    display: {
      development: false,
      production: false
    },

    graph: {
      nodes: [
        {name: 'browser', class: AppletBrowser},
        {name: 'ui', class: brainsatplay.plugins.interfaces.UI}
      ],
      edges: [
        {
          source: 'browser:element',
          target: 'ui:content'
        }
      ]
    }
}
