export class Neurofeedback{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        // Operator Configuration 
        this.paramOptions = {
            metric: {
                default: 'Alpha Coherence', 
                options: [
                    'Alpha Coherence', 
                    'Focus', 
                    'Alpha Beta Ratio', 
                    'Alpha Theta Ratio', 
                    'Theta Beta Ratio', 
                    'Alpha Ratio', 
                    'Gamma Peak', 
                    'Low Gamma Score', 
                    'HEG Score'
                ]
            },
            output: {
                default: 'Mean',
                options: ['Mean']
            }
            
        }

        // Defaults
        this.ports = {
            default: {
                analysis: ['eegcoherence'],
                defaults: {
                    output: [{data: 0, meta: {label: `neurofeedback`}}]
                },
            }, 
        } 
    }

    init = () => {}

    deinit = () => {
        // MUST DISCONNECT STREAM
    }

    default = (userData) => {
        
        userData.forEach(u => {
            
            let arr = []
            // let data = (u.data != null) ? u.data : this.session.atlas.data
            let data = this.session.atlas.data

            try {
                
                /* 
                
                EEG Neurofeedback

                */

                let eegMetrics = [
                    'Alpha Beta Ratio',
                    'Alpha Theta Ratio',
                    'Theta Beta Ratio',
                    'Alpha Ratio',
                    'Gamma Peak',
                    'Low Gamma Score'
                ]

                if (eegMetrics.includes(this.params.metric)){
                    data.eeg.forEach(ch => {
                        if (this.params.metric === 'Alpha Beta Ratio'){
                            arr.push(this.session.atlas.getAlphaBetaRatio(ch))
                        } else if (this.params.metric === 'Alpha Theta Ratio'){
                            arr.push(this.session.atlas.getAlphaThetaRatio(ch))
                        } else if (this.params.metric === 'Theta Beta Ratio'){
                            arr.push(this.session.atlas.getThetaBetaRatio(ch))
                        } else if (this.params.metric === 'Alpha Ratio'){
                            arr.push(this.session.atlas.getAlphaRatio(ch))
                        } else if (this.params.metric === 'Gamma Peak'){
                            arr.push(this.session.atlas.get40HzGamma(ch))
                        } else if (this.params.metric === 'Low Gamma Score'){
                            arr.push(this.session.atlas.getLowGammaScore(ch))
                        } else {
                            arr.push(0)
                        }
                    })
                }

                /* 

                    Coherence Neurofeedback

                */
                let coherenceMetrics = [
                    'Alpha Coherence'
                ]

                if (coherenceMetrics.includes(this.params.metric)){
                    data.coherence.forEach(e => {
                        if (this.params.metric === 'Alpha Coherence'){
                            let value = this.session.atlas.getCoherenceScore(e,'alpha1')
                            arr.push(value)
                        }
                    })
                }

                /* 

                    HEG Neurofeedback

                */

                let hegMetrics = [
                    'HEG Score'
                ]

                if (hegMetrics.includes(this.params.metric)){

                    data.heg.forEach(ch => {
                        if (this.params.metric === 'HEG Score'){
                            arr.push(this.session.atlas.getHEGRatioScore(ch))
                        } else {
                            arr.push(0)
                        }
                    })
                }


                /* 

                    Custom Neurofeedback

                */

                if (this.params.metric === 'Focus'){
                    let frontalData = this.session.atlas.getFrontalData()
                    frontalData.forEach(ch => {
                        arr.push(Math.min(1/this.session.atlas.getThetaBetaRatio(ch), 1))
                    })
                }

            } catch {
                console.error('input not compatible')
                arr.push(0)
            }       
            
            // Output to User Data Object
            if (this.params.output === 'Mean') u.data = this.session.atlas.mean(arr)
            else u.data = arr

            u.meta.label = this.params.metric
        })

        return userData
    }
}