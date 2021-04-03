
import {brainsatplay} from './js/brainsatplay'
import {BCIAppManager} from './js/frontend/BCIAppManager'
import {DOMFragment} from './js/frontend/utils/DOMFragment'

import {AppletExample} from './js/applets/AppletExample'
import {uPlotApplet} from './js/applets/General/uPlotApplet'
import {SpectrogramApplet} from './js/applets/EEG/SpectrogramApplet'
import { BrainMapApplet } from './js/applets/EEG/BrainMapApplet'
import { SmoothieApplet } from './js/applets/EEG/SmoothieApplet'
import { NexusApplet } from './js/applets/nexus/NexusApplet'

import { CircleApplet } from './js/applets/HEG/Circle'

let applets = [
	{	name:"Smooth",         	cls: SmoothieApplet		},
	{	name:"Nexus",      		cls: NexusApplet		},
	{	name:"Spectrogram",    	cls: SpectrogramApplet	},
	{	name:"uPlot", 			cls: uPlotApplet   		},
	{	name:"Brain Map",      	cls: BrainMapApplet		},
	{   name:"Circle", 			cls: CircleApplet		},
	{	name:"Example Applet", 	cls: AppletExample 		},
];//sssssymmetry (ღ˘⌣˘ღ)

let bcisession = new brainsatplay('guest','','game');

let mgr = new BCIAppManager(bcisession,applets,undefined,false);

mgr.init();

