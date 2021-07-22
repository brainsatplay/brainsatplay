class Parser{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.params = {}

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            state: null
        }

        this.props.container = document.createElement('div')
        this.props.container.id = this.props.id
        this.props.container.style = `
            width: 80%;
        `

        this.props.label = document.createElement('h1')
        this.props.readout = document.createElement('div')

        this.props.label.innerHTML = 'LABEL'
        this.props.readout.innerHTML = `<p class="readout" >Username: Data</p>`

        this.props.container.insertAdjacentElement('beforeend', this.props.label)
        this.props.container.insertAdjacentElement('beforeend', this.props.readout)

        // Port Definition
        this.ports = {
            default: {
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (userData) => {

                    this.props.label.innerHTML = userData[0].meta.label
                    let coherenceReadouts = this.props.readout.querySelectorAll(`.readout`)
            
                    let nameRegistry = new Set(userData.map(u => u.username))
            
                    for (let readout of coherenceReadouts){
                        if (Array.isArray(userData)){
                            let username = readout.id.replace(`${this.props.id}-`,'')
                            let found = userData.find(u => u.username === username)
                            if (found) {
                                nameRegistry.delete(found.username)
                                readout.innerHTML = `${found.username}: ${found.data}`
                            } else {
                                readout.remove()
                            }
                        }
                    }
            
                    nameRegistry.forEach(name => {
                        let u = userData.find(u => u.username === name)
                        let value = u.data
                        if (typeof value === "number") value = value.toFixed(2)
                        this.props.readout.innerHTML += `<p id="${this.props.id}-${u.username}" class="readout" >${u.username}: ${u.data}</p>`
                    })
            },
            
        }, 
        element: {
            default: this.props.container,
            input: {type: null},
            output: {type: Element},
        }
        }
    }

    init = () =>  {}

    deinit = () => {}
}

export {Parser}