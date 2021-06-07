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
            default: {}
        }
    }

    init = () => {

        let HTMLtemplate = () => {
            return `
            <div id='${this.props.id}' style='display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;'>
                <div style="width: 100%; padding: 0px 10%;">
                    <h1 id="${this.props.id}-label"></h1>
                    <p id="${this.props.id}-readout"></p>
                    <div id="${this.props.id}-bar" style="background: transparent; height: 7px; width: 100%; border: 1px solid white; ">
                        <div style="background: white; height: 100%; width: 100%;">
                    </div>
                </div>
            </div>`
        }


        let setupHTML = (app) => {}

        return {HTMLtemplate, setupHTML}
    }

    default = (userData) => {
        let labelDiv = document.getElementById(`${this.props.id}-label`)
        labelDiv.innerHTML = userData[0].meta.state
        let outputDiv = document.getElementById(`${this.props.id}-readout`)
        let barDiv = document.getElementById(`${this.props.id}-bar`)
        let statePercentage = userData[0].meta.stateTimeElapsed / userData[0].meta.stateDuration

        // Fill a Progress Bar
        let fillBar = barDiv.querySelector('div')
        if (userData[0].meta.state === 'ITI') fillBar.style.background = 'red'
        else fillBar.style.background = 'lime'

        fillBar.style.width = `${statePercentage*100}%`

        return userData
    }

    deinit = () => {}
}

export {UI}