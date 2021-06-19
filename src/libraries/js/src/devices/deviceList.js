
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
import { timefluxPlugin } from './timeflux/timefluxPlugin'
import { BlueberryPlugin } from './blueberry/blueberryPlugin';


export const deviceList = [
    {'name': 'Synthetic', id:'synthetic', company:'Brains@Play', analysis: ['eegcoherence'], cls: syntheticPlugin},
    {'name': 'Brainstorm', id:'brainstorm',company:'Brains@Play', analysis: ['eegcoherence'], cls: brainstormPlugin},
    {'name': 'Notion', id:'notion', company:'Neurosity', analysis: ['eegcoherence'], cls: notionPlugin},
    {'name': 'Muse 2', id:'muse', company:'InteraXon', analysis: ['eegcoherence'], variants:['', 'Aux'], cls: musePlugin, chromeOnly: true},
    {'name': 'Muse S', id:'muse', company:'InteraXon', analysis: ['eegcoherence'], variants:[''], cls: musePlugin, chromeOnly: true},
    {'name': 'Ganglion', id:'ganglion', company:'OpenBCI', analysis: ['eegcoherence'], cls: ganglionPlugin, chromeOnly: true},
    {'name': 'Cyton', id:'cyton', company:'OpenBCI', analysis: ['eegcoherence'], variants: ['','Daisy'], cls: cytonPlugin, chromeOnly: true},
    {'name': 'HEGduino', id:'hegduino', company:'HEGAlpha', analysis: [], variants: ['USB','Bluetooth'], cls: hegduinoPlugin, chromeOnly: true},
    {'name': 'FreeEEG32', id:'freeeg32', company:'Neuroidss', analysis: ['eegcoherence'], variants: ['2','19'], cls: eeg32Plugin, chromeOnly: true},
    {'name': 'Buzz', id:'buzz', company:'Neosensory', analysis: [], cls: buzzPlugin, chromeOnly: true},
    {'name': 'BCI2000', id:'bci2k', company:'BCI2000', analysis: ['eegcoherence'], variants:['Operator', 'Data'], cls: bci2000Plugin},
    {'name': '8 Channel Proto', id:'8chproto', company:'Brains@Play', analysis: ['eegcoherence'], cls: Prototype8Plugin, chromeOnly: true},
    {'name': 'Timeflux', id:'timefux', company:'Timeflux', analysis: ['eegcoherence'], cls: timefluxPlugin},
    {'name': 'Blueberry', id:'blueberry', company:'Blueberry', analysis: [], cls: BlueberryPlugin, chromeOnly: true},
    {'name': 'WebGazer', id:'webgazer', company:'WebGazer', analysis: [], cls: webgazerPlugin},

]