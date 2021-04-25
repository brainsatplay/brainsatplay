
import placeholderImg from '../../assets/features/placeholder.png'
import eegNFImage from './../../assets/features/eegNF.png'
import hegImage from './../../assets/features/hegbiofeedback.png'

// { folderUrl:'', name:'', categories:[] }
export const AppletInfo = {
    'Applet Browser': { folderUrl:'./UI/browser',       devices:['eeg','heg'],     categories:['UI']},
    'Randomizer': { folderUrl:'./UI/randomizer',        devices:['eeg','heg'],     categories:['UI']},
    'uPlot': { folderUrl:'./General/uplot',             devices:['eeg','heg'],     categories:['data']},
    'Spectrogram': { folderUrl:'./EEG/spectrogram',     devices:['eeg'],           categories:['data']},
    'Brain Map': { folderUrl:'./EEG/brainmap',          devices:['eeg'],           categories:['data']},
    'Smoothie': { folderUrl:'./EEG/smoothie',           devices:['eeg'],           categories:['data']},
    'Nexus': { folderUrl:'./General/threejs/nexus',     devices:['eeg'],           categories:['multiplayer','feedback']},
    'Blob': { folderUrl:'./General/threejs/blob',       devices:['eeg','heg'],           categories:['feedback']},
    'Enso': { folderUrl:'./General/threejs/enso',       devices:['eeg','heg'],           categories:['feedback']},
    'Cosmos': { folderUrl:'./General/threejs/cosmos',   devices:['eeg','heg'],           categories:['feedback']},
    'Blink': { folderUrl:'./EEG/blink',                 devices:['eeg'],           categories:['feedback']},
    'Band Ring': { folderUrl:'./EEG/bandring',          devices:['eeg'],           categories:['feedback'] },
    'Brain Art': { folderUrl:'./EEG/brainart',          devices:['eeg'],           categories:['feedback'] },
    'Connectome': { folderUrl:'./EEG/connectome',       devices:['eeg'],           categories:['feedback'] },
    'Pixi': { folderUrl:'./EEG/pixi',                   devices:['eeg'],           categories:['feedback'] },
    'Circle': { folderUrl:'./HEG/circle',               devices:['heg'],           categories:['feedback'] },
    'Audio': { folderUrl:'./General/audio',             devices:['eeg','heg'],     categories:['feedback'] },
    'Video': { folderUrl:'./General/video',             devices:['eeg','heg'],     categories:['feedback'] },
    'Boids':{ folderUrl:'./HEG/boids',                  devices:['eeg'],           categories:['feedback'] },
    'Hill Climber': { folderUrl:'./HEG/hillclimber',    devices:['heg'],           categories:['feedback'] },
    'Text Scroller': { folderUrl:'./HEG/textscroller',  devices:['heg'],           categories:['feedback'] },
    'Sunrise': { folderUrl:'./General/threejs/ThreeSunrise', devices:['heg'],      categories:['feedback'] },
    'Pulse Monitor': { folderUrl:'./HEG/pulsemonitor',  devices:['heg'],           categories:['data'] },
    'Youtube': { folderUrl:'./General/ytube',           devices:['eeg','heg'],     categories:['feedback'] },
    'Multiplayer Example': { folderUrl:'./Templates/Multiplayer', devices:['eeg','heg'], categories:['multiplayer','feedback'] },
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
