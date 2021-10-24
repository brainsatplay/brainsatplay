import {Manager} from "./Manager.js"
import file from './assets/lofi-productivity.mp3'
import image from './assets/evokedresponse.jpeg'

export const settings = {
        "name":"Evoked Response",
        "devices":["EEG"],
        "author":"Adam Hewett + Garrett Flynn",
        "description":"Get started building a neurofeedback app!",
        "categories":["learn"],
        "instructions":"Coming soon...",
        "display":{"production":false,"development":true},
        "graph":{
                "nodes":[
                        {"name":"eeg","class":brainsatplay.plugins.biosignals.EEG},
                        {"name":"audio","class":brainsatplay.plugins.audio.Audio,"params":{file}},
                        {"name":"manager","class":Manager,"params":{image}},
                        {"name":"ui","class":brainsatplay.plugins.interfaces.UI,"params":{"style":"\n          .brainsatplay-ui-container {\n           width: 100%;\n            height: 100%;\n         z-index: 1;     }\n\n          #content {\n            width: 100%;\n            height: 100%;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n          }\n          "}},

                        // {"id":"mic","class":brainsatplay.plugins.audio.Microphone},   
                        {"name":"spectrogram","class":brainsatplay.plugins.displays.Spectrogram},
                        {"name":"background","class":brainsatplay.plugins.interfaces.UI,"params":{"style":"\n          .brainsatplay-ui-container {\n        width: 100%;\n            height: 100%;\n  position: absolute; top: 0; left: 0;        }\n\n          #content {\n            width: 100%;\n            height: 100%;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n          }\n          "}},
                ],"edges":[

                        {"source":"eeg:atlas","target":"manager:data"}, // send data
                        {"source":"manager:element","target":"ui:content"}, // display element
                        
                        // trigger when file is decoded                        
                        {"source":"audio:file","target":"audio:toggle"}, 
                        {"source":"audio:file","target":"manager:ready"},

                        // background
                        {"source":"eeg:atlas","target":"spectrogram:atlas"},
                        {"source":"spectrogram:element","target":"background:content"},

                ]
        },
        "image":image,
        "connect":true
        };