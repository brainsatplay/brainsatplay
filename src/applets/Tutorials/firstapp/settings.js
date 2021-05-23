
// import featureImg from './feature.png'
import {Coherence} from '../../../libraries/js/src/nodes/Coherence'


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
    "nodes": [Coherence],
    "props": {id},
    "responses": {
        coherence: (userData) => {
          let html = ``
          userData.forEach(u => {
              if (u.coherence != undefined){
              html += `<p>${u.username}: ${u.coherence}</p>`
              }
          })
          document.getElementById(`${id}-coherence`).innerHTML = html
      }
    },
    "template": () => {return `
    <div id='${id}' style='height:100%; width:100%; display: flex; align-items: center; justify-content: center;'>
        <div>
            <h1>Frontal Alpha Coherence</h1>
            <p id="${id}-coherence"></p>
        </div>
    </div>
    `}
}
