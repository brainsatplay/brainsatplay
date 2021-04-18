import { AppletBrowser } from './UI/AppletBrowser'
import { RandomizerApplet } from './UI/randomizer/RandomizerApplet'

// import {AppletExample} from './AppletExample'
// import {MLApplet} from './EEG/machinelearning/MLApplet'

import {uPlotApplet} from './General/other/uplot/uPlotApplet'
import {SpectrogramApplet} from './EEG/spectrogram/SpectrogramApplet'
import { BrainMapApplet } from './EEG/BrainMapApplet'
import { SmoothieApplet } from './EEG/smoothie/SmoothieApplet'
import { NexusApplet } from './General/threejs/nexus/NexusApplet'
import { BlobApplet } from './General/threejs/blob/BlobApplet'
import { EnsoApplet } from './General/threejs/enso/EnsoApplet'
import { CosmosApplet } from './General/threejs/cosmos/CosmosApplet'
import { BlinkApplet } from './EEG/blink/Blink'
import { BandRingApplet } from './EEG/bandring/BandRing'
import { BrainArtApplet } from './EEG/brainart/BrainArtApplet'
import { ConnectomeApplet } from './EEG/connectome/ConnectomeApplet'
// import { PixiApplet } from './EEG/pixi/PixiApplet'

import { CircleApplet } from './HEG/circle/Circle'
import { AudioApplet } from './General/other/audio/AudioApplet'
import { VideoApplet } from './General/other/video/VideoApplet'
import { BoidsApplet } from './HEG/boids/Boids'
import { HillClimberApplet } from './HEG/hillclimber/HillClimber'
import { TextScrollerApplet } from './HEG/textscroller/TextScroller'
import { ThreeSunriseApplet } from './General/threejs/ThreeSunrise/ThreeSunriseApplet'
import { PulseMonitorApplet } from './HEG/pulsemonitor/PulseMonitorApplet'

import placeholderImg from './../../assets/features/placeholder.png'
import eegNFImage from './../../assets/features/eegNF.png'
import hegImage from './../../assets/features/hegbiofeedback.png'


let applets = new Map([
	[
        BlobApplet.name,
        BlobApplet,
    ],
	[
        CosmosApplet.name,
        CosmosApplet,	
    ],
    [	
        uPlotApplet.name, 	
        uPlotApplet
    ],
    [	
        SpectrogramApplet.name,    	
        SpectrogramApplet,
    ],
    [	
        NexusApplet.name,      		
        NexusApplet,		
    ],
    [	
        EnsoApplet.name,      		
        EnsoApplet,
    ],
    [	SmoothieApplet.name,
        SmoothieApplet,
    ],
	[	
        BrainMapApplet.name,      	
        BrainMapApplet,
    ],
	[   
        CircleApplet.name, 		
        CircleApplet,
    ],
	[   
        BoidsApplet.name,       
        BoidsApplet,
    ],
	[   
        AudioApplet.name,       
        AudioApplet	,
    ],
	[   
        VideoApplet.name,		
        VideoApplet,
    ],
	[   
        ThreeSunriseApplet.name,         
        ThreeSunriseApplet,
    ],
	[   
        HillClimberApplet.name,     
        HillClimberApplet,
    ],
	[   
        TextScrollerApplet.name,   
        TextScrollerApplet,
    ],
    [   
        PulseMonitorApplet.name,   
        PulseMonitorApplet,
    ],
	[	
        BlinkApplet.name,      		
        BlinkApplet,
    ],
	[	
        BandRingApplet.name,       
        BandRingApplet,
    ],
    [	
        BrainArtApplet.name,       
        BrainArtApplet,
    ],
    [	
        ConnectomeApplet.name,       
        ConnectomeApplet,
    ],
    // [   
    //     PixiApplet.name,
    //     PixiApplet
    // ]
]);

let presets = [
    {
        value: 'browser',
        name: "Applet Browser",
        applets: [
            AppletBrowser,
        ],
        description: "Choose any applet.",
        image: placeholderImg,
        lock: false
    },
    {
        value: 'eeg',
        name: "EEG Neurofeedback",
        applets: [
            BlobApplet,
            BrainMapApplet,
            SpectrogramApplet,
            uPlotApplet,
        ],
        description: "Bandpower training, coherence, and more.",
        type: "EEG",
        image: eegNFImage,
        lock: false
    },
    {
        value: 'heg',
        name: "HEG Biofeedback",
        applets: [
            BoidsApplet,
            CircleApplet,
            AudioApplet,
            uPlotApplet,
        ],
        description: "Brain blood flow training!",
        type: "HEG",
        image: hegImage,
        lock: false
    },
    {
        value: 'randomizer',
        name: "Randomizer",
        applets: [
            RandomizerApplet,
        ],
        description: "Experience a random applet every 10 seconds!",
        type: "All",
        image: placeholderImg,
        lock: true	
    }
]

export {applets, presets}