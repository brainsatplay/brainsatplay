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
                    input: [{username: 'Username', data: 'Value', meta: {label: 'Waiting for Data'}}]
                }
            }
        }
    }

    init = () => {

        let HTMLtemplate = () => {
            return ``
        }


        let setupHTML = (app) => {}

        return {HTMLtemplate, setupHTML}
    }

    default = (userData) => {}

    deinit = () => {}
}

export {UI}