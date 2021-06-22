

import placeholderImg from './assets/features/placeholder.png'
import eegNFImage from '../applets/General/blob/img/feature.png'
import HEGImage from './assets/features/hegbiofeedback.png'
import hegsens from '../applets/General/sensorium/feature.png'
import studio from '../applets/WIPs/studio/feature.png'
import OBB from '../applets/UI/onebitbonanza/feature.jpg'

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
        value: 'HEGSensorium',
        name: "HEG Sensorium",
        applets: [
            'Sensorium',
            'Pulse Monitor'
        ],
        description: "Immersive audio-visual feedback with HEG graphing.",
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
        image: OBB,
        lock: true	
    },
    {
        value: 'Studio',
        name: "Brains@Play Studio",
        applets: [
            'Brains@Play Studio',
        ],
        description: "Create your own application with Brains@Play.",
        type: "All",
        image: studio,
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
]
