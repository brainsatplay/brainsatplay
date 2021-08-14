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
        this.props.readouts = document.createElement('div')

        this.props.label.innerHTML = 'LABEL'

        // this.props.defaultReadout = document.createElement('p')
        // this.props.defaultReadout.classList.add('readout')
        // this.props.defaultReadout.innerHTML = 'Username: Data'
        // this.props.readouts.insertAdjacentElement('beforeend', this.props.defaultReadout)

        this.props.container.insertAdjacentElement('beforeend', this.props.label)
        this.props.container.insertAdjacentElement('beforeend', this.props.readouts)

        // Port Definition
        this.ports = {
            default: {
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.props.label.innerHTML = userData[0].meta.label    
                    
                    userData.forEach(u => {
                        let readout = document.getElementById(`${this.props.id}-${u.id}`)
                        readout.innerHTML = `${u.username}: ${u.data}`
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

    _userAdded = (userData) => {
        let u = userData[0]
        console.log(userData)
        this.props.readouts.innerHTML += `<p id="${this.props.id}-${u.id}" class="readout" >${u.username}: ${u.data ?? ''}</p>`
        this._updateUI()
    }

    _userRemoved = (userData) => {
        let u = userData[0]
        console.log(userData)
        let readout = document.getElementById(`${this.props.id}-${u.id}`)
        readout.remove()
        this._updateUI()
    }

    _updateUI = () => {
        // let coherenceReadouts = this.props.readouts.querySelectorAll(`.readout`)
        // if (coherenceReadouts.length > 1) this.props.defaultReadout.style.display = 'none'
        // else this.props.defaultReadout.style.display = 'block'
    }
}

export {Parser}