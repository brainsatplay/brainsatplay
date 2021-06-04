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
            }
        }
    }

    init = () => {

        let HTMLtemplate = () => {
            return `
            <div id='${this.props.id}' style='display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;'>
            </div>`
        }


        let setupHTML = (app) => {}

        return {HTMLtemplate, setupHTML}
    }

    default = (userData) => {
        let container = document.getElementById(`${this.props.id}`)
        if (userData[0].data){
            container.insertAdjacentHTML('beforeend',`Buzz Connected`)
        } else {
            container.insertAdjacentHTML('beforeend',`Buzz Disconnected`)
        }
        return userData
    }

    deinit = () => {}
}

export {UI}