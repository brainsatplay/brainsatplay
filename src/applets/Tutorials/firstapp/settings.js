
// import featureImg from './feature.png'
import {Coherence} from '../../../libraries/js/src/nodes/Coherence'
import {UI} from './UI'


let id = String(Math.floor(Math.random()*1000000))

export const settings = {
    "name": "My First Applet",
    "type": 'Application',
    "devices": ["EEG"],
    "author": "Me",
    "description": "This is my first applet.",
    "categories": ["tutorial"],
    "module": "Applet",
    // "image":  featureImg,
    "instructions":"Coming soon...",
    "plugins": {
      processing: [Coherence],
      ui: [UI]
    }
}
