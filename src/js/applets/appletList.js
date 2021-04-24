
import placeholderImg from '../../assets/features/placeholder.png'
import eegNFImage from './../../assets/features/eegNF.png'
import hegImage from './../../assets/features/hegbiofeedback.png'

// { folderUrl:'', name:'', categories:[] }
export const AppletFolderUrls = [
    { folderUrl:'./UI/browser',       name:'Applet Browser', devices:['eeg','heg'],     categories:['UI']},
    { folderUrl:'./UI/randomizer',    name:'Randomizer',     devices:['eeg','heg'],     categories:['UI']},
    { folderUrl:'./General/uplot',    name:'uPlot',          devices:['eeg','heg'],     categories:['data']},
    { folderUrl:'./EEG/spectrogram',  name:'Spectrogram',    devices:['eeg'],           categories:['data']},
    { folderUrl:'./EEG/brainmap',     name:'Brain Map',      devices:['eeg'],           categories:['data']},
    { folderUrl:'./EEG/smoothie',     name:'Smoothie',       devices:['eeg'],           categories:['data']},
    { folderUrl:'./General/threejs/nexus',  name:'Nexus',    devices:['eeg','heg'],     categories:['multiplayer','feedback']},
    { folderUrl:'./General/threejs/blob',   name:'Blob',     devices:['eeg','heg'],     categories:['feedback']},
    { folderUrl:'./General/threejs/enso',   name:'Enso',     devices:['eeg','heg'],     categories:['feedback']},
    { folderUrl:'./General/threejs/cosmos', name:'Cosmos',   devices:['eeg','heg'],     categories:['feedback']},
    { folderUrl:'./EEG/blink',        name:'Blink',          devices:['eeg'],           categories:['feedback']},
    { folderUrl:'./EEG/bandring',     name:'Band Ring',      devices:['eeg'],           categories:['feedback'] },
    { folderUrl:'./EEG/brainart',     name:'Brain Art',      devices:['eeg'],           categories:['feedback'] },
    { folderUrl:'./EEG/connectome',   name:'Connectome',     devices:['eeg'],           categories:['feedback'] },
    { folderUrl:'./EEG/pixi',         name:'Pixi',           devices:['eeg','heg'],     categories:['feedback'] },
    { folderUrl:'./HEG/circle',       name:'Circle',         devices:['heg'],           categories:['feedback'] },
    { folderUrl:'./General/audio',    name:'Audio',          devices:['eeg','heg'],     categories:['feedback'] },
    { folderUrl:'./General/video',    name:'Video',          devices:['eeg','heg'],     categories:['feedback'] },
    { folderUrl:'./HEG/boids',        name:'Boids',          devices:['eeg'],           categories:['feedback'] },
    { folderUrl:'./HEG/hillclimber',  name:'Hill Climber',   devices:['heg'],           categories:['feedback'] },
    { folderUrl:'./HEG/textscroller', name:'Text Scroller',  devices:['heg'],           categories:['feedback'] },
    { folderUrl:'./General/threejs/ThreeSunrise', name:'Sunrise', devices:['heg'],      categories:['feedback'] },
    { folderUrl:'./HEG/pulsemonitor', name:'Pulse Monitor',  devices:['heg'],           categories:['data'] },
    { folderUrl:'./General/ytube',    name:'Youtube',        devices:['eeg','heg'],     categories:['feedback'] },
    { folderUrl:'./Templates/Multiplayer', name:'Multiplayer Example', devices:['eeg','heg'], categories:['multiplayer','feedback'] },
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
            let result = await getAppletSettings(url.folderUrl);
            result.moduleURL = url.folderUrl+"/"+result.module
            if(category === undefined)
                settings.set(result.name,result); // then onclick run getApplet(moduleUrl)
            else if (result.settings.categories.indexOf(category) > -1) 
                settings.set(result.name,result); // then onclick run getApplet(moduleUrl)

            onload(url.folderUrl,result);
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
