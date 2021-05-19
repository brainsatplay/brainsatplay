
import { eeg32Plugin } from './freeeeg32/freeeeg32Plugin';
import { musePlugin } from './musePlugin';
import { hegduinoPlugin } from './hegduino/hegduinoPlugin';
import { cytonPlugin } from './cyton/cytonPlugin';
import { webgazerPlugin } from './webgazerPlugin'
import { ganglionPlugin } from './ganglion/ganglionPlugin';
import { buzzPlugin } from './buzzPlugin';
import { syntheticPlugin } from './synthetic/syntheticPlugin';
import { brainstormPlugin } from './brainstorm/brainstormPlugin';
import { bci2000Plugin } from './bci2000/bci2000Plugin';


export const deviceList = [
    {'name': 'Synthetic', company:'Brains@Play', analysis: ['eegcoherence'], cls: syntheticPlugin},
    {'name': 'Brainstorm', company:'Brains@Play', analysis: ['eegcoherence'], cls: brainstormPlugin},
    {'name': 'Muse', company:'InteraXon', analysis: ['eegcoherence'], variants:['', 'Aux'], cls: musePlugin},
    {'name': 'Ganglion', company:'OpenBCI', analysis: ['eegcoherence'], cls: ganglionPlugin},
    {'name': 'Cyton', company:'OpenBCI', analysis: ['eegcoherence'], variants: ['','Daisy'], cls: cytonPlugin},
    {'name': 'HEGduino', company:'HEGAlpha', analysis: [], variants: ['usb','bt'], cls: hegduinoPlugin},
    {'name': 'FreeEEG32', company:'Neuroidss', analysis: ['eegcoherence'], variants: ['2','19'], cls: eeg32Plugin},
    {'name': 'Buzz', company:'Neosensory', analysis: [], cls: buzzPlugin},
]