import {StateManager} from './StateManager'



//Initial state values
export const State = new StateManager(
    {
        applets:[],
        appletConfigs:[],
        appletsSpawned:0,
        maxApplets:4,
        appletClasses:[],
        
        counter:0,
        lastPostTime:0,
        FFTResult:[],
        coherenceResult:[],
        freqStart:1, //FFT constraints
        freqEnd:128,
        fftViewStart:0, //FFT indices to grab from
        fftViewEnd:127,
        nSec:1,
        fdBackMode: 'coherence',

        connected:false,
        analyze:false,
        rawFeed:false,
        
        useFilters:true,
        uVScaling:true,
        sma4:true,
        notch50:true,
        notch60:true,
        bandpass:false,
        lowpass50:false, //Causes some amplitude loss
        dcblocker:true,
        filtered:{},
        filterers:[],

        workerMaxSpeed: 50,

        sessionName:"",
        sessionChunks:0,
        saveCounter: 5120,//Countdown to saving based on max buffer size in eeg32, leave this alone
        newSessionIdx: 0,
        newSessionCt: 0,
        fileSizeLimitMb: 100
        //File size limited mainly due to browser memory limits. Data will be downloaded in chunks of max specified size for large datasets.
        //To estimate file size: 1 sec data = (99-3*nTaggedChannels)*sps + workerMaxSpeed*256*4*nFFTChannels + workerMaxSpeed*256*4*nCoherenceChannels. The *4 is for a 32 bit float (4 bytes).
        //2 channels collection of 2 fft, 1 coherence, and 3 channels of data = roughly 68.1Kbps, 4.09Mb per min, 245.1Mb per hour.
        //32 channels raw + accelerometer = ~51.7Kbps. 32 FFTs = ~655Kbps. (n^2+n) / 2 coherence channels for 16 channels = 136 Coherence channels = ~2.8Mbps
    }
);

