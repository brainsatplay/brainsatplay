class Manager{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.params = {}

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),            
        }
        this.props.container = document.createElement('div')
        this.props.container.id = this.props.id
        this.props.container.style = 'width: 100%; padding: 0px 10%;'
        this.props.container.innerHTML = `
            <h1 id="${this.props.id}-label"></h1>
            <p id="${this.props.id}-readout"></p>
            <div id="${this.props.id}-bar" style="background: transparent; height: 7px; width: 100%; border: 1px solid white; ">
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
                        // data.eeg.forEach(o => {
                        //     console.log(o)
                        // })
                    })
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
                    else fillBar.style.background = 'lime'
            
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