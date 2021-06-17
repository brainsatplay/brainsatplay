// kevin was here

class UI{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.params = {}

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000))
        }

        // Port Definition
        this.ports = {
            default: {
                defaults: {
                    input: [{data: false, meta: {label: 'buzz_status'}}]
                }
            },
            button: {}
        }
    }

    init = () => {

        let HTMLtemplate = () => {
            return `
            <div id='${this.props.id}' style='display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;'>
                <div>
                    <h3 id="${this.props.id}status"></h3>
                    <button id="${this.props.id}punch" class="brainsatplay-default-button">Trigger a Punch</button>
                </div>
            </div>`
        }


        let setupHTML = (app) => {}

        return {HTMLtemplate, setupHTML}
    }

    _activateButtonPort = () => {
            console.log(this)
            this.session.graph.runSafe(this,'button', [{data: true, meta:{label: `${this.label}_triggered`, user: `${this.session.info.auth.username}`}}])
    }

    default = (userData) => {
        let container = document.getElementById(`${this.props.id}`)
        let button = document.getElementById(`${this.props.id}punch`)
        button.addEventListener('click', this._activateButtonPort)

        // Change Text Based on Status
        let statusDiv = document.getElementById(`${this.props.id}status`)
        if (userData[0].data){
            statusDiv.innerHTML = `Buzz Connected`

            // When the Button is Clicked, Activate the "button" Port and Pass My Username
            let button = document.getElementById(`${this.props.id}punch`)
            button.innerHTML = 'Trigger a Punch'
            button.style.opacity = 1.0
            button.addEventListener('click', this._activateButtonPort)
            
        } else {
            statusDiv.innerHTML = `Buzz Disconnected`
            button.innerHTML = 'Trigger a Punch'
            button.style.opacity = 0.3
            button.removeEventListener('click', this._activateButtonPort)
        }
        return userData
    }

    button = (userData) => {
        return userData
    }

    deinit = () => {}
}

export {UI}