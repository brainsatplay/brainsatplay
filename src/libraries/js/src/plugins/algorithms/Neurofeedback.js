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
                options: ['Mean', 'Channels']
            }
        }

        this.props = {
            feedbackInfo: {

                    'Select your neurofeedback': {
                        disabled: true,
                        function: () => {return 1}
                    },

                                        
                    // Coherence Neurofeedback
                    'Alpha Coherence': {
                        type: 'coherence',
                        function: (ch) => this.session.atlas.getCoherenceScore(ch,'alpha1')
                    },

                    // Custom Neurofeedback
                    'Focus': {
                        type: 'custom',
                        function: (data) => {
                            let arr = []
                            let frontalData = this.session.atlas.getFrontalData(data)
                            frontalData.forEach(ch => {
                                arr.push(Math.min(1/this.session.atlas.getThetaBetaRatio(ch), 1))
                            })
                            return arr
                        }
                    },

                    // 'ASoC Induction': { 

                    // },

                    // Per-Channel EEG Neurofeedback
                    'Alpha Beta Ratio': {
                        type: 'coherence',
                        function: (ch) => this.session.atlas.getAlphaBetaRatio(ch)
                    },
                    'Alpha Theta Ratio': {
                        type: 'coherence',
                        function: (ch) => this.session.atlas.getAlphaThetaRatio(ch)
                    },
                    'Theta Beta Ratio': {
                        type: 'coherence',
                        function: (ch) => this.session.atlas.getThetaBetaRatio(ch)
                    },
                    'Alpha Ratio': {
                        type: 'coherence',
                        function: (ch) => this.session.atlas.getAlphaRatio(ch)
                    },
                    'Gamma Peak': {
                        type: 'coherence',
                        function: (ch) => this.session.atlas.get40HzGamma(ch)
                    },
                    'Low Gamma Score': {
                        type: 'coherence',
                        function: (ch) => this.session.atlas.getLowGammaScore(ch)
                    },

                    // Per-Channel HEG Neurofeedback
                    'HEG Score': {
                        type: 'coherence',
                        function: (ch) => this.session.atlas.getHEGRatioScore(ch)
                    },

            }
        }

        this.props.selector = document.createElement('select')
        Object.keys(this.props.feedbackInfo).forEach(key => {
                let o = this.props.feedbackInfo[key]
                if (o.disabled) this.props.selector.insertAdjacentHTML('beforeend', `<option value="${key}" disabled>${key}</option>`)
                else this.props.selector.insertAdjacentHTML('beforeend', `<option value="${key}">${key}</option>`)
            });


        this.props.selector.onchange = (e) => {
            this.params.metric = e.target.value
        }

        // Ports
        this.ports = {
            default: {
                analysis: ['eegcoherence'],
                default: 1,
                meta: {label: `neurofeedback`},
                input: {type: Object, name: 'DataAtlas'},
                output: {type: 'number'},
            },  


            metric: {
                edit: false,
                default: 'Alpha Coherence', 
                options: Object.keys(this.props.feedbackInfo),
                input: {type: null},
                output: {type: null},
            },

            output: {
                edit: false,
                default: 'Mean',
                options: ['Mean', 'Channels'],
                input: {type: null},
                output: {type: null},
            },

            element: {
                default: this.props.selector,
                input: {type: null},
                output: {type: Element},
            }
        } 
    }

    init = () => {}

    deinit = () => {}

    default = (user) => {
                    
            let arr = []
            let data = (user.data != null) ? user.data : this.session.atlas.data

            try {

                let type = this.props.feedbackInfo[this.params.metric].type
                if (type === 'custom'){
                    arr = this.props.feedbackInfo[this.params.metric].function(data) ?? []
                } else {
                    data[type].forEach(o => {
                        arr.push(this.props.feedbackInfo[this.params.metric].function(o) ?? 0)
                    })
                }

            } catch (e) {
                console.error(e)
                arr.push(0)
            }       
            
            // Output to User Data Object
            if (this.params.output === 'Channels') user.data = arr
            else user.data = this.session.atlas.mean(arr)

            user.meta.label = this.params.metric

        return user
    }
}