export class UI{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.props = {
            id: String(Math.floor(Math.random()*1000000))
        }
        this.params = params
    }

    init = () => {
        // Simply define the HTML template
        let HTMLtemplate = () => {return `
            <div id='${this.props.id}' style='height:100%; width:100%; display: flex; align-items: center; justify-content: center;'>
                <div>
                    <h1>Frontal Alpha Coherence</h1>
                    <div id="${this.props.id}-readout"></div>
                </div>
            </div>`
        }


        let setupHTML = () => {}


        let responses = null

        let shared = null
        // let shared = (userData) => {
        //     let html = ``
        //     userData.forEach(u => {
        //         let userStyle = (u[this.params.toggle]?.value ? "color: red;" : "")
        //         html += `<p style="${userStyle}">${u.username}: ${u.coherence?.value}</p>`
        //     })

        //     document.getElementById(`${this.props.id}-coherence`).innerHTML = html
        // }

        return {HTMLtemplate, setupHTML ,responses, shared}
    }

    update = (input) => {
        console.log('update', input)
    }

    // Write UI using Graph Ports
    readout = (userData) => {
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