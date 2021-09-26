class Manager{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            state: null
        }

        // Port Definition
        this.ports = {
            data: {
                input: {type: undefined},
                output: {type: null},
                onUpdate: (user) => {
                    console.log(user.data)
                    user.data.eeg.forEach(o => {
                        console.log(o)
                    })
                }
            }, 
        }
    }

    init = () => {

    }


    deinit = () => {}
}

export {Manager}