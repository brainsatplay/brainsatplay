export class SignalAcquisition {

    constructor(session){
        
        this.signals = {

            brain: {
                eeg: {
                    devices: [

                    ]
                },
                fmri: {},
                ecog: {},
                pet: {},
                meg: {},
                fnirs: {}
            },
            other: {
                emg: {},
                ekg: {},
                eog: {},
                gsr: {}
            }

        }
    }
}