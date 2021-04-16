import { AppletBrowser } from './UI/AppletBrowser'

import {AppletExample} from './AppletExample'
import {uPlotApplet} from './General/uPlotApplet'
import {SpectrogramApplet} from './EEG/SpectrogramApplet'
import { BrainMapApplet } from './EEG/BrainMapApplet'
import { SmoothieApplet } from './EEG/SmoothieApplet'
import { NexusApplet } from './General/threejs/nexus/NexusApplet'
import { BlobApplet } from './General/threejs/blob/BlobApplet'
import { EnsoApplet } from './General/threejs/enso/EnsoApplet'
import { CosmosApplet } from './General/threejs/cosmos/CosmosApplet'
import { BlinkApplet } from './EEG/Blink'
import { BandRingApplet } from './EEG/bandring/BandRing'

import { CircleApplet } from './HEG/Circle'
import { AudioApplet } from './General/AudioApplet'
import { VideoApplet } from './General/VideoApplet'
import { BoidsApplet } from './HEG/Boids'
import { HillClimberApplet } from './HEG/HillClimber'
import { TextScrollerApplet } from './HEG/TextScroller'
import { ThreeSunriseApplet } from './General/threejs/ThreeSunrise/ThreeSunriseApplet'

import placeholderImg from './../../assets/placeholderImg.png'


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
        image: placeholderImg	  	
    },
    {
        value: 'heg',
        name: "HEG Biofeedback",
        applets: [
            "HEG Boids",
            "HEG Circle",
            "HEG Audio",
            "uPlot",
        ],
        description: "Brain blood flow training!",
        image: placeholderImg	
    }
]

export {applets, presets}