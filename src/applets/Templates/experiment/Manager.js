class Manager{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.params = {}

        this.analysis = ['eegfft']

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),            
        }
        this.props.container = document.createElement('div')
        this.props.container.id = this.props.id
        this.props.container.innerHTML = `
            <div style="width: 100%; text-align: center;">
                <p id="${this.props.id}-readout" style="  
                display:inline-block;
                width:25px;
                height:25px;
                
                background:
                linear-gradient(#fff,#fff),
                linear-gradient(#fff,#fff),
                #000;
                background-position:center;
                background-size: 100% 2px,2px 100%; /*thickness = 2px, length = 50% (25px)*/
                background-repeat:no-repeat;
                "></p>
            </div>
            <h3 id="${this.props.id}-label"></h3>
            <div id="${this.props.id}-bar" style="background: transparent; height: 7px; width: 100%; position: absolute; bottom: 0; left: 0;">
                <div style="background: white; height: 100%; width: 100%;">
            </div>`


        // Port Definition
        this.ports = {
            // default: {
            //     output: {type: null}
            // },
            data: {
                input: {type: undefined},
                output: {type: null},
                onUpdate: (userData) => {
                    userData.forEach(u => {
                        let data = u.data
                        console.log(data)
                        data.eeg.forEach(o => {
                            console.log(o)
                        })
                    })
                    // return [{data: null}] // Return Alpha
                }
            }, 

            schedule: {
                input: {type: 'string'},
                output: {type: null},
                onUpdate: (userData) => {
                    let labelDiv = document.getElementById(`${this.props.id}-label`)
                    labelDiv.innerHTML = userData[0].meta.state
                    let barDiv = document.getElementById(`${this.props.id}-bar`)
                    let statePercentage = userData[0].meta.stateTimeElapsed / userData[0].meta.stateDuration
                    // Fill a Progress Bar
                    let fillBar = barDiv.querySelector('div')
                    if (userData[0].meta.state === 'ITI') fillBar.style.background = 'red'
                    else fillBar.style.background = '#00FF00'
            
                    if (statePercentage > 1) statePercentage = 1
                    fillBar.style.width = `${statePercentage*100}%`
                }
            },

            element: {
                edit: false,
                input: {type: null},
                output: {type: Element},
                default: this.props.container,
                onUpdate: () => {
                    this.params.element = this.props.container
                    return [{data: this.params.element}]
                }
            }
        }
    }

    init = () => {}

    deinit = () => {}
}

export {Manager}