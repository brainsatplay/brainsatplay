export class UI{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session

        // UI Details
        this.props = {
            id: String(Math.floor(Math.random()*1000000))
        }

        this.params = params

        this.paramOptions = {}

        this.ports = {
            default: {
                defaults: {
                    input: [{username: 'Username', value: 'Value', label: 'Waiting for Data...'}]
                }
            },
            readout: {
                defaults: {
                    input: [{}]
                }
            }, 
            color: {
                defaults: {
                    input: [{}]
                }
            }
        }
    }

    init = () => {
        // Simply define the HTML template
        let HTMLtemplate = () => {return `
            <div id='${this.props.id}' style='height:100%; width:100%; display: flex; align-items: center; justify-content: center;'>
                <div>
                    <h1 id="${this.props.id}-label"></h1>
                    <div id="${this.props.id}-readout"></div>
                </div>
            </div>`
        }


        let setupHTML = () => {}

        return {HTMLtemplate, setupHTML}
    }

    default = (input) => {
        console.log('default', input)
        return input
    }

    // Write UI using Graph Ports
    readout = (userData) => {
        let labelDiv = document.getElementById(`${this.props.id}-label`)
        labelDiv.innerHTML = userData[0].label
        let outputDiv = document.getElementById(`${this.props.id}-readout`)
        let coherenceReadouts = outputDiv.querySelectorAll(`.readout`)

        let nameRegistry = new Set(userData.map(u => u.username))

        for (let readout of coherenceReadouts){
            if (Array.isArray(userData)){
                let username = readout.id.replace(`${this.props.id}-`,'')
                let found = userData.find(u => u.username === username)
                if (found) {
                    nameRegistry.delete(found.username)
                    readout.innerHTML = `${found.username}: ${found.value}`
                } else {
                    readout.remove()
                }
            }
        }

        nameRegistry.forEach(name => {
            let u = userData.find(u => u.username === name)
            outputDiv.innerHTML += `<p id="${this.props.id}-${u.username}" class="readout" >${u.username}: ${u.value}</p>`
        })
    }

    color = (userData) => {
        let coherenceReadouts = document.getElementById(`${this.props.id}-readout`).querySelectorAll(`.readout`)
        if (Array.isArray(userData)){
            userData.forEach(u =>{
            for (let readout of coherenceReadouts){
                if (readout.id.replace(`${this.props.id}-`,'') === u.username){
                    readout.style = (u.value ? "color: red;" : "")
                }
            }
        })
    }
    }
    

    deinit = () => {}
}