export class Focus{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session) {
        this.label = label
        this.session = session
        
        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            canvas: null,
            looping: false,
            container: document.createElement('div')
        }

        this.props.container.id = this.props.id
        this.props.container.style = 'display: flex; align-items: center; justify-content: center; width: 100%; height: 150px;'


        this.ports = {
            default: {
                edit: false,
                analysis: ['eegcoherence'],
                data: undefined,
                input: {type: Object, name: 'DataAtlas'},
                output: {type: 'boolean'},
                onUpdate: (user) => {
                    let data = Math.sin(Date.now()/1000) > 0
                    console.log(user.data)
                    let alpha = []
                    let beta = []

                    user.data.eeg.forEach(o => {
                        alpha.push(o.means.alpha1[o.fftCount - 1], o.means.alpha2[o.fftCount - 1])
                        beta.push(o.means.beta[o.fftCount - 1])
                    })
                    console.log('Average Alpha',this.session.atlas.mean(alpha))
                    console.log('Average Beta',this.session.atlas.mean(beta))

                    return {data}
                }
            },

            element: {
                data: this.props.container,
                input: {type: null},
                output: {type: Element},
            },

            debug: {data: false},

        }
    }

    init = () => {}

    deinit = () => {}
}