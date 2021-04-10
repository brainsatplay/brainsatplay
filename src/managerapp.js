
import {brainsatplay} from './js/brainsatplay'
import {BCIAppManager} from './js/frontend/BCIAppManager'
import {DOMFragment} from './js/frontend/utils/DOMFragment'

import {AppletExample} from './js/applets/AppletExample'
import {uPlotApplet} from './js/applets/General/uPlotApplet'
import {SpectrogramApplet} from './js/applets/EEG/SpectrogramApplet'
import { BrainMapApplet } from './js/applets/EEG/BrainMapApplet'
import { SmoothieApplet } from './js/applets/EEG/SmoothieApplet'
import { NexusApplet } from './js/applets/nexus/NexusApplet'
import { BlobApplet } from './js/applets/blob/BlobApplet'
import { EnsoApplet } from './js/applets/enso/EnsoApplet'

import { CircleApplet } from './js/applets/HEG/Circle'
import { AudioApplet } from './js/applets/HEG/AudioApplet'
import { VideoApplet } from './js/applets/HEG/VideoApplet'
import { BoidsApplet } from './js/applets/HEG/Boids'

let applets = [
	{	name:"Smooth",         	cls: SmoothieApplet		},
	{	name:"Spectrogram",    	cls: SpectrogramApplet	},
	{	name:"uPlot", 			cls: uPlotApplet   		},
	{	name:"Enso",      		cls: EnsoApplet			},
	{	name:"Blob",      		cls: BlobApplet			},
	{	name:"Brain Map",      	cls: BrainMapApplet		},
	{	name:"Nexus",      		cls: NexusApplet		},
	{   name:"HEGCircle", 		cls: CircleApplet		},
	{   name:"HEGBoids",        cls: BoidsApplet		},
	{   name:"HEGAudio",        cls: AudioApplet		},
	{   name:"HEGVideo",		cls: VideoApplet		}, // 
	{	name:"Example Applet", 	cls: AppletExample 		},
];//sssssymmetry (ღ˘⌣˘ღ)

let bcisession = new brainsatplay('guest','','game');

let mgr = new BCIAppManager(bcisession,applets,undefined,true);

