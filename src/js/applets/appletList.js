
import placeholderImg from '../../assets/features/placeholder.png'
import eegNFImage from './../../assets/features/eegNF.png'
import hegImage from './../../assets/features/hegbiofeedback.png'
import nexusImage from './../../js/applets/General/threejs/nexus/img/feature.png'

// { folderUrl:'', name:'', categories:[] }
export const AppletInfo = {
    'Applet Browser': { folderUrl:'./UI/browser',       devices:['eeg','heg'],     categories:['UI']},
    'Randomizer': { folderUrl:'./UI/randomizer',        devices:['eeg','heg'],     categories:['UI']},
    'uPlot': { folderUrl:'./General/uplot',             devices:['eeg','heg'],     categories:['connect']},
    'Spectrogram': { folderUrl:'./EEG/spectrogram',     devices:['eeg'],           categories:['connect']},
    'Brain Map': { folderUrl:'./EEG/brainmap',          devices:['eeg'],           categories:['connect']},
    'Smoothie': { folderUrl:'./EEG/smoothie',           devices:['eeg'],           categories:['connect']},
    'Bar Chart': { folderUrl:'./EEG/barcharts',         devices:['eeg'],           categories:['connect']},
    'Nexus': { folderUrl:'./General/threejs/nexus',     devices:['eeg'],           categories:['train','brainstorm']},
    'Blob': { folderUrl:'./General/threejs/blob',       devices:['eeg','heg'],           categories:['train']},
    'Enso': { folderUrl:'./General/threejs/enso',       devices:['eeg','heg'],           categories:['train']},
    'Cosmos': { folderUrl:'./General/threejs/cosmos',   devices:['eeg','heg'],           categories:['train']},
    'Blink': { folderUrl:'./EEG/blink',                 devices:['eeg'],           categories:['train']},
    'Band Ring': { folderUrl:'./EEG/bandring',          devices:['eeg'],           categories:['train'] },
    'Brain Art': { folderUrl:'./EEG/brainart',          devices:['eeg'],           categories:['train'] },
    'Connectome': { folderUrl:'./EEG/connectome',       devices:['eeg'],           categories:['train'] },
    'Pixi': { folderUrl:'./EEG/pixi',                   devices:['eeg'],           categories:['train'] },
    'Circle': { folderUrl:'./HEG/circle',               devices:['heg'],           categories:['train'] },
    'Audio': { folderUrl:'./General/audio',             devices:['eeg','heg'],     categories:['train'] },
    'Video': { folderUrl:'./General/video',             devices:['eeg','heg'],     categories:['train'] },
    'Boids':{ folderUrl:'./HEG/boids',                  devices:['eeg'],           categories:['train'] },
    'Hill Climber': { folderUrl:'./HEG/hillclimber',    devices:['heg'],           categories:['train'] },
    'HEG Session Plotter': { folderUrl:'./HEG/sessionplotter',    devices:['heg'],           categories:['connect'] },
    'Text Scroller': { folderUrl:'./HEG/textscroller',  devices:['heg'],           categories:['train'] },
    'Sunrise': { folderUrl:'./General/threejs/ThreeSunrise', devices:['heg'],      categories:['train'] },
    'Pulse Monitor': { folderUrl:'./HEG/pulsemonitor',  devices:['heg'],           categories:['connect'] },
    'Youtube': { folderUrl:'./General/ytube',           devices:['eeg','heg'],     categories:['train'] },
    'Multiplayer Example': { folderUrl:'./Templates/Multiplayer', devices:['eeg','heg'], categories:['play','brainstorm'] },
    'Three.js Gallery': { folderUrl:'./General/threejs/gallery', devices:['eeg'], categories:['train'] },
    'VR Applet': { folderUrl:'./General/threejs/vr', devices:['eeg','heg'], categories:['train'] },
    'Attractors': { folderUrl:'./General/threejs/attractors', devices:['eeg','heg'], categories:['train'] },

};

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
    let module = await dynamicImport(AppletInfo[settings.name].folderUrl+"/"+settings.module + '.js');
    return module[settings.module];
}

export let generateSettings = (appletInfo, from=0, to='end', category=undefined, onload=(url,result)=>{}) => {
    let settings = new Map();
    let appletKeys = Object.keys(appletInfo)
    if(to === 'end') to = appletKeys.length;

    appletKeys.forEach(async (key,i) => {
        if(i >= from && i < to) {
            let result = await getAppletSettings(appletInfo[key].folderUrl);
            if(category === undefined)
                settings.set(result.name,result); 
            else if (result.settings.categories.indexOf(category) > -1) 
                settings.set(result.name,result);

            onload(appletInfo[key].folderUrl,result);
        }
    });

    return settings;
}

// export let appletSettings = generateSettings(AppletInfo);
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
            'Pulse Monitor',
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
