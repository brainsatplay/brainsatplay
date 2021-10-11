import {Manager} from "./Manager.js"
import file from './assets/lofi-productivity.mp3'
import image from './assets/evokedresponse.jpeg'

export const settings = {
        "name":"Evoked Response",
        "devices":["EEG"],
        "author":"Garrett Flynn",
        "description":"Get started building a neurofeedback app!",
        "categories":["learn"],
        "instructions":"Coming soon...",
        "display":{"production":false,"development":true},
        "graph":{
                "nodes":[
                        {"id":"eeg","class":brainsatplay.plugins.biosignals.EEG},
                        {"id":"audio","class":brainsatplay.plugins.audio.Audio,"params":{file}},
                        {"id":"parser","class":Manager,"params":{image}},
                        {"id":"ui","class":brainsatplay.plugins.interfaces.UI,"params":{"style":"\n          .brainsatplay-ui-container {\n            width: 100%;\n            height: 100%;\n          }\n\n          #content {\n            width: 100%;\n            height: 100%;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n          }\n          "}}
                ],"edges":[
                        {"source":"eeg:atlas","target":"parser:data"},
                        {"source":"parser:element","target":"ui:content"}
                ]
        },
        "version":"0.0.35",
        "image":null,
        "connect":true
        };