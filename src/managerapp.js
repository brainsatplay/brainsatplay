
import {brainsatplay} from './js/brainsatplay'
import {BCIAppManager} from './js/frontend/BCIAppManager'
import {DOMFragment} from './js/frontend/utils/DOMFragment'

import {AppletExample} from './js/applets/AppletExample'
import {uPlotApplet} from './js/applets/General/uPlotApplet'
import {SpectrogramApplet} from './js/applets/EEG/SpectrogramApplet'
import { BrainMapApplet } from './js/applets/EEG/BrainMapApplet'
import { SmoothieApplet } from './js/applets/EEG/SmoothieApplet'
import { NexusApplet } from './js/applets/General/threejs/nexus/NexusApplet'
import { BlobApplet } from './js/applets/General/threejs/blob/BlobApplet'
import { EnsoApplet } from './js/applets/General/threejs/enso/EnsoApplet'
import { CosmosApplet } from './js/applets/General/threejs/cosmos/CosmosApplet'

import { CircleApplet } from './js/applets/HEG/Circle'
import { AudioApplet } from './js/applets/HEG/AudioApplet'
import { VideoApplet } from './js/applets/HEG/VideoApplet'
import { BoidsApplet } from './js/applets/HEG/Boids'
import { HillClimberApplet } from './js/applets/HEG/HillClimber'
import { TextScrollerApplet } from './js/applets/HEG/TextScroller'
import { ThreeSunriseApplet } from './js/applets/HEG/ThreeSunrise/ThreeSunrise'

let applets = [
	{	name:"Enso",      		cls: EnsoApplet			},
	{	name:"Blob",      		cls: BlobApplet			},
	{	name:"Nexus",      		cls: NexusApplet		},
	{	name:"Cosmos",      	cls: CosmosApplet		},
	{	name:"uPlot", 			cls: uPlotApplet   		},
	{	name:"Smooth",         	cls: SmoothieApplet		},
	{	name:"Spectrogram",    	cls: SpectrogramApplet	},
	{	name:"Brain Map",      	cls: BrainMapApplet		},
	{   name:"HEGCircle", 		cls: CircleApplet		},
	{   name:"HEGBoids",        cls: BoidsApplet		},
	{   name:"HEGAudio",        cls: AudioApplet		},
	{   name:"HEGVideo",		cls: VideoApplet		}, // 
	{   name:"Sunrise",         cls: ThreeSunriseApplet },
	{   name:"HillCimber",      cls: HillClimberApplet  },
	{   name:"TextScroller",    cls: TextScrollerApplet },
];//sssssymmetry (ღ˘⌣˘ღ)

let bcisession = new brainsatplay('guest','','game');

let mgr = new BCIAppManager(bcisession,applets,undefined,true);

