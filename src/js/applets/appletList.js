
import placeholderImg from '../../assets/features/placeholder.png'
import eegNFImage from './../../assets/features/eegNF.png'
import HEGImage from './../../assets/features/hegbiofeedback.png'
import nexusImage from './../../js/applets/General/threejs/nexus/img/feature.png'

// { folderUrl:'', name:'', categories:[] }
export const AppletInfo = {
    'Applet Browser': { folderUrl:'./UI/browser',       devices:['EEG','HEG'],     categories:['UI']},
    'Randomizer': { folderUrl:'./UI/randomizer',        devices:['EEG','HEG'],     categories:['UI']},
    'Profile Manager': { folderUrl:'./UI/profile', devices:['EEG','HEG'], categories:['UI'] },
    'uPlot': { folderUrl:'./General/uplot',             devices:['EEG','HEG'],     categories:['connect']},
    'Spectrogram': { folderUrl:'./EEG/spectrogram',     devices:['EEG'],           categories:['connect']},
    'Brain Map': { folderUrl:'./EEG/brainmap',          devices:['EEG'],           categories:['connect']},
    'Smoothie': { folderUrl:'./EEG/smoothie',           devices:['EEG'],           categories:['connect']},
    'Bar Chart': { folderUrl:'./EEG/barcharts',         devices:['EEG'],           categories:['connect']},
    'Nexus': { folderUrl:'./General/threejs/nexus',     devices:['EEG'],           categories:['train','brainstorm']},
    'Blob': { folderUrl:'./General/threejs/blob',       devices:['EEG','HEG'],           categories:['train']},
    'Enso': { folderUrl:'./General/threejs/enso',       devices:['EEG','HEG'],           categories:['train']},
    'Cosmos': { folderUrl:'./General/threejs/cosmos',   devices:['EEG','HEG'],           categories:['train']},
    'Blink': { folderUrl:'./EEG/blink',                 devices:['EEG'],           categories:['train']},
    'Band Ring': { folderUrl:'./EEG/bandring',          devices:['EEG'],           categories:['train'] },
    'Brain Art': { folderUrl:'./EEG/brainart',          devices:['EEG'],           categories:['train'] },
    'Connectome': { folderUrl:'./EEG/connectome',       devices:['EEG'],           categories:['train'] },
    'Pixi': { folderUrl:'./EEG/pixi',                   devices:['EEG'],           categories:['train'] },
    'Circle': { folderUrl:'./HEG/circle',               devices:['HEG'],           categories:['train'] },
    'Audio': { folderUrl:'./General/audio',             devices:['EEG','HEG'],     categories:['train'] },
    'Video': { folderUrl:'./General/video',             devices:['EEG','HEG'],     categories:['train'] },
    'Boids':{ folderUrl:'./HEG/boids',                  devices:['EEG'],           categories:['train'] },
    'Hill Climber': { folderUrl:'./HEG/hillclimber',    devices:['HEG'],           categories:['train'] },
    'HEG Session Plotter': { folderUrl:'./HEG/sessionplotter',    devices:['HEG'],           categories:['connect'] },
    'Text Scroller': { folderUrl:'./HEG/textscroller',  devices:['HEG'],           categories:['train'] },
    'Sunrise': { folderUrl:'./General/threejs/ThreeSunrise', devices:['HEG'],      categories:['train'] },
    'Pulse Monitor': { folderUrl:'./HEG/pulsemonitor',  devices:['HEG'],           categories:['connect'] },
    'Youtube': { folderUrl:'./General/ytube',           devices:['EEG','HEG'],     categories:['train'] },
    'Multiplayer Example': { folderUrl:'./Templates/Multiplayer', devices:['EEG','HEG'], categories:['play','brainstorm'] },
    'Three.js Gallery': { folderUrl:'./General/threejs/gallery', devices:['EEG'], categories:['train'] },
    'VR Applet': { folderUrl:'./General/threejs/vr', devices:['EEG','HEG'], categories:['train'] },
    'Attractors': { folderUrl:'./General/threejs/attractors', devices:['EEG','HEG'], categories:['train'] },
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
        value: 'EEG',
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
        value: 'HEG',
        name: "HEG Biofeedback",
        applets: [
            'Boids',
            'Circle',
            'Audio',
            'Pulse Monitor',
        ],
        description: "Brain blood flow training!",
        type: "HEG",
        image: HEGImage,
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
