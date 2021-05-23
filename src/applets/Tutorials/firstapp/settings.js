
// import featureImg from './feature.png'
import {Coherence} from '../../../libraries/js/src/nodes/Coherence'

export const settings = {
    "name": "My First Applet",
    "devices": ["EEG"],
    "author": "Me",
    "description": "This is my first applet.",
    "categories": ["tutorial"],
    "module": "Applet",
    // "image":  featureImg,
    "instructions":"Coming soon...",
    "nodes": [Coherence],
    "responses": {
        coherence: (userData) => {
          let html = ``
          userData.forEach(u => {
              if (u.coherence != undefined){
              html += `<p id="${this.props.id}-user-${u.username}">${u.username}: ${u.coherence}</p>`
              }
          })
          document.getElementById(`${this.props.id}-coherence`).innerHTML = html
      }
    },
    "template": (props) => {return `
    <div id='${props.id}' style='height:100%; width:100%; display: flex; align-items: center; justify-content: center;'>
        <div>
            <h1>Frontal Alpha Coherence</h1>
            <p id="${props.id}-coherence"></p>
        </div>
    </div>
    `}
}
