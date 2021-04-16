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
        description: "Train your brain.",
        cls: BlobApplet			
    },
	{
        name:"Cosmos",
        description: "Train your brain.",
        cls: CosmosApplet		
    },
    {	
        name:"uPlot", 	
        description: "See your brain.",		
        cls: uPlotApplet
    },
    {	
        name:"Spectrogram",    	
        cls: SpectrogramApplet,
        description: "See your brain.",
    },
    {	
        name:"Nexus",      		
        cls: NexusApplet,		
        description: "Train your brain.",
    },
    {	
        name:"Enso",      		
        cls: EnsoApplet,
        description: "Train your brain.",	
    },
    {	name:"Smooth",
        cls: SmoothieApplet,
        description: "See your brain.",	
    },
	{	
        name:"Brain Map",      	
        cls: BrainMapApplet,
        description: "See your brain."		
    },
	{   
        name:"Circle", 		
        cls: CircleApplet,
        description: "Train your brain."		
    },
	{   
        name:"Boids",       
        cls: BoidsApplet,
        description: "Train your brain."		
    },
	{   
        name:"Audio",       
        cls: AudioApplet	,
        description: "Train your brain."	
    },
	{   
        name:"Video",		
        cls: VideoApplet,
        description: "Train your brain."		
    },
	{   
        name:"Sunrise",         
        cls: ThreeSunriseApplet,
        description: "Train your brain." 
    },
	{   
        name:"Hill Climber",     
        cls: HillClimberApplet,
        description: "Train your brain." 
    },
	{   
        name:"Text Scroller",   
        cls: TextScrollerApplet,
        description: "Train your brain." 
    },
	{	
        name:"Blink",      		
        cls: BlinkApplet,
        description: "Play with your brain."		
    },
	{	
        name:"Band Ring",       
        cls: BandRingApplet,
        description: "Train your brain."  	
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