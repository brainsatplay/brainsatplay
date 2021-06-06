

import placeholderImg from './assets/features/placeholder.png'
import eegNFImage from './assets/features/eegNF.png'
import HEGImage from './assets/features/hegbiofeedback.png'
import hegsens from './assets/features/sensoriumheg.png'

export let presetManifest = [
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
            'Circle',
            'Boids',
            'Audio',
            'Pulse Monitor',
        ],
        description: "Brain blood flow training!",
        type: "HEG",
        image: HEGImage,
        lock: false
    },
    {
        value: 'HEGSensorium',
        name: "HEG Sensorium",
        applets: [
            'Sensorium',
            'Pulse Monitor'
        ],
        description: "Sensorium with HEG graphing.",
        type: "HEG",
        image: hegsens,
        lock: false
    },
    {
        value: 'onebitbonanza',
        name: "One Bit Bonanza",
        applets: [
            'One Bit Bonanza',
        ],
        description: "Experience a random low-bandwidth game every 10 seconds!",
        type: "All",
        image: placeholderImg,
        lock: true	
    }
]
