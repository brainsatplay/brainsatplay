class UI{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            container: document.createElement('div')
        }

        this.props.container = document.createElement('div')
        this.props.container.id = this.props.id
        this.props.container.style = 'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%'


        // Port Definition
        this.ports = {
            default: {
                data: false,
                onUpdate: (user) => {
                    let container = document.getElementById(`${this.props.id}`)
                    let button = document.getElementById(`${this.props.id}buzz`)
            
                    // Change Text Based on Status
                    let statusDiv = document.getElementById(`${this.props.id}status`)
                    if (user.data){
                        statusDiv.innerHTML = `Buzz Connected`
            
                        // When the Button is Clicked, Activate the "button" Port and Pass My Username
                        let button = document.getElementById(`${this.props.id}buzz`)
                        button.innerHTML = 'Trigger a Buzz'
                        button.style.opacity = 1.0
                        button.addEventListener('click', this._activateButtonPort)
                        
                    } else {
                        statusDiv.innerHTML = `Buzz Disconnected`
                        button.innerHTML = 'Trigger a Buzz'
                        button.style.opacity = 0.3
                        button.removeEventListener('click', this._activateButtonPort)
                    }
                    return user
                }
            },
            button: {},

            element: {
                data: this.props.container,
                input: {type: null},
                output: {type: Element}
            }
        }
    }

    init = () => {
        this.props.container.innerHTML = `
        <div>
            <h3 id="${this.props.id}status">Buzz Disconnected</h3>
            <button id="${this.props.id}buzz" class="brainsatplay-default-button disabled">Trigger a Buzz</button>
        </div>
        `
    }

    _activateButtonPort = () => {
            this.session.graph.runSafe(this,'button', {data: true, meta:{label: `${this.label}_triggered`, user: `${this.session.info.auth.id}`}})
    }

    deinit = () => {}
}

export {UI}