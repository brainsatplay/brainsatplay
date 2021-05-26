
import { eeg32Plugin } from './freeeeg32/freeeeg32Plugin';
import { musePlugin } from './musePlugin';
import { hegduinoPlugin } from './hegduino/hegduinoPlugin';
import { cytonPlugin } from './cyton/cytonPlugin';
import { webgazerPlugin } from './webgazerPlugin'
import { ganglionPlugin } from './ganglion/ganglionPlugin';
import { buzzPlugin } from './neosensory/buzzPlugin';
import { syntheticPlugin } from './synthetic/syntheticPlugin';
import { brainstormPlugin } from './brainstorm/brainstormPlugin';
import { bci2000Plugin } from './bci2000/bci2000Plugin';
import { Prototype8Plugin } from './8ch_prototype/8chPlugin'
import { notionPlugin } from './neurosity/notionPlugin'


export const deviceList = [
    {'name': 'Synthetic', id:'synthetic', company:'Brains@Play', analysis: ['eegcoherence'], cls: syntheticPlugin},
    {'name': 'Brainstorm', id:'brainstorm',company:'Brains@Play', analysis: ['eegcoherence'], cls: brainstormPlugin},
    {'name': 'Notion', id:'notion', company:'Neurosity', analysis: ['eegcoherence'], cls: notionPlugin},
    {'name': 'Muse 2', id:'muse', company:'InteraXon', analysis: ['eegcoherence'], variants:['', 'Aux'], cls: musePlugin},
    {'name': 'Muse S', id:'muse', company:'InteraXon', analysis: ['eegcoherence'], variants:[''], cls: musePlugin},
    {'name': 'Ganglion', id:'ganglion', company:'OpenBCI', analysis: ['eegcoherence'], cls: ganglionPlugin},
    {'name': 'Cyton', id:'cyton', company:'OpenBCI', analysis: ['eegcoherence'], variants: ['','Daisy'], cls: cytonPlugin},
    {'name': 'HEGduino', id:'hegduino', company:'HEGAlpha', analysis: [], variants: ['USB','Bluetooth'], cls: hegduinoPlugin},
    {'name': 'FreeEEG32', id:'freeeg32', company:'Neuroidss', analysis: ['eegcoherence'], variants: ['2','19'], cls: eeg32Plugin},
    {'name': 'Buzz', id:'buzz', company:'Neosensory', analysis: [], cls: buzzPlugin},
    {'name': 'BCI2000', id:'bci2k', company:'BCI2000', analysis: ['eegcoherence'], variants:['Operator', 'Data'], cls: bci2000Plugin},
    {'name': '8 Channel Proto', id:'8chproto', company:'Brains@Play', analysis: ['eegcoherence'], cls: Prototype8Plugin},
]