import { AppletBrowser } from './UI/AppletBrowser'

import {AppletExample} from './AppletExample'
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

import { CircleApplet } from './HEG/circle/Circle'
import { AudioApplet } from './General/other/audio/AudioApplet'
import { VideoApplet } from './General/other/video/VideoApplet'
import { BoidsApplet } from './HEG/boids/Boids'
import { HillClimberApplet } from './HEG/hillclimber/HillClimber'
import { TextScrollerApplet } from './HEG/textscroller/TextScroller'
import { ThreeSunriseApplet } from './General/threejs/ThreeSunrise/ThreeSunriseApplet'

import placeholderImg from './../../assets/features/placeholder.png'
import eegNFImage from './../../assets/features/eegNF.png'
import hegImage from './../../assets/features/hegbiofeedback.png'


let applets = [
    {
        name:"Applet Browser",
        description: "Select an applet.",
        cls: AppletBrowser		
    },
	{
        name:"Blob",
        cls: BlobApplet,
        description: "Calm the blob!",
    },
	{
        name:"Cosmos",
        cls: CosmosApplet,	
        description: "Evolve the galaxy!",
    },
    {	
        name:"uPlot", 	
        description: "Live data plotter",		
        cls: uPlotApplet
    },
    {	
        name:"Spectrogram",    	
        cls: SpectrogramApplet,
        description: "Bandpower and coherence visualizer.",
    },
    {	
        name:"Nexus",      		
        cls: NexusApplet,		
        description: "Connect your brain with others!",
    },
    {	
        name:"Enso",      		
        cls: EnsoApplet,
        description: "Calm the ring!",	
    },
    {	name:"Smooth",
        cls: SmoothieApplet,
        description: "Simple real time bandpower and coherence plot.",	
    },
	{	
        name:"Brain Map",      	
        cls: BrainMapApplet,
        description: "Bandpower and coherence mapping."		
    },
	{   
        name:"Circle", 		
        cls: CircleApplet,
        description: "Increase your HEG ratio!"		
    },
	{   
        name:"Boids",       
        cls: BoidsApplet,
        description: "Play with swarm intelligence! Your HEG ratio creates swirls!"		
    },
	{   
        name:"Audio",       
        cls: AudioApplet	,
        description: "HEG ratio and EEG Coherence feedback."	
    },
	{   
        name:"Video",		
        cls: VideoApplet,
        description: "HEG ratio and EEG Coherence feedback."		
    },
	{   
        name:"Sunrise",         
        cls: ThreeSunriseApplet,
        description: "Your HEG ratio turns the Earth!" 
    },
	{   
        name:"Hill Climber",     
        cls: HillClimberApplet,
        description: "Increase HEG ratio, go up" 
    },
	{   
        name:"Text Scroller",   
        cls: TextScrollerApplet,
        description: "HEG text reader idea" 
    },
	{	
        name:"Blink",      		
        cls: BlinkApplet,
        description: "Blink detect/staring contest :P"		
    },
	{	
        name:"Band Ring",       
        cls: BandRingApplet,
        description: "Bandpower visualizer."  	
    },

];

let presets = [
    {
        value: 'browser',
        name: "Applet Browser",
        applets: [
            "Applet Browser",
        ],
        description: "Choose an applet.",
        image: placeholderImg	
    },
    {
        value: 'eeg',
        name: "EEG Neurofeedback",
        applets: [
            "Blob",
            "Brain Map",
            "Spectrogram",
            "uPlot",
        ],
        description: "Bandpower training, coherence, and more.",
        type: "EEG",
        image: eegNFImage	  	
    },
    {
        value: 'heg',
        name: "HEG Biofeedback",
        applets: [
            "Boids",
            "Circle",
            "Audio",
            "uPlot",
        ],
        description: "Brain blood flow training!",
        type: "HEG",
        image: hegImage	
    }
]

export {applets, presets}