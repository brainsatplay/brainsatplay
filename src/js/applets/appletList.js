
import placeholderImg from '../../assets/features/placeholder.png'
import eegNFImage from './../../assets/features/eegNF.png'
import hegImage from './../../assets/features/hegbiofeedback.png'


export const AppletFolderUrls = [
    './UI/browser',
    './UI/randomizer',
    './General/uplot',
    './EEG/spectrogram',
    './EEG/brainmap',
    './EEG/smoothie',
    './General/threejs/nexus',
    './General/threejs/blob',
    './General/threejs/enso',
    './General/threejs/cosmos',
    './EEG/blink',
    './EEG/bandring',
    './EEG/brainart',
    './EEG/connectome',
    './EEG/pixi',
    './HEG/circle',
    './General/audio',
    './General/video',
    './HEG/boids',
    './HEG/hillclimber',
    './HEG/textscroller',
    './General/threejs/ThreeSunrise',
    './HEG/pulsemonitor',
    './General/ytube',
    './Templates/Multiplayer',
];

export let dynamicImport = async (url) => {
    let module = await import(url);
    return module;
}

export let getAppletSettings = async (AppletFolderUrl) => {
    let config = await dynamicImport(AppletFolderUrl+"/settings.js");
    //let image = await dynamicImport(AppletFolderUrl+"/"+config.settings.image);
    return config.settings;
}

export let getApplet = async (settings) => {
    let module = await dynamicImport(settings.moduleURL + '.js');
    return module[settings.module];
}

export let generateSettings = (urls, from=0, to='end', category=undefined, onload=(url,result)=>{}) => {
    let settings = new Map();
    if(to === 'end') to = urls.length;

    urls.forEach(async (url,i) => {
        if(i >= from && i < to) {
            let result = await getAppletSettings(url);
            result.moduleURL = url+"/"+result.module
            if(category === undefined)
                settings.set(result.name,result); // then onclick run getApplet(moduleUrl)
            else if (result.settings.categories.indexOf(category) > -1) 
                settings.set(result.name,result); // then onclick run getApplet(moduleUrl)

            onload(url,result);
            //Add a card to the applet manager here
        }
    });

    return settings;
}

export let appletSettings = generateSettings(AppletFolderUrls);
//while(settings.get('uPlot') === undefined) { /*...awaiting...*/  }

export let presets = [
    {
        value: 'eeg',
        name: "EEG Neurofeedback",
        applets: [
            'Blob',
            'Brain Map',
            'Spectrogram',
            'uPlot',
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
            'Boids',
            'Circle',
            'Audio',
            'uPlot',
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
            'Randomizer',
        ],
        description: "Experience a random applet every 10 seconds!",
        type: "All",
        image: placeholderImg,
        lock: true	
    }
]
