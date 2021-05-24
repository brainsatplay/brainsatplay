export class UI{
    constructor(id, session, params) {
        this.id = 'myfirstapplet'
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
                    <p id="${this.props.id}-coherence"></p>
                </div>
            </div>`
        }


        let setupHTML = () => {}


        let responses = null

        let shared = (userData) => {
            let html = ``
            userData.forEach(u => {
                let userStyle = (u[this.params.toggle]?.value ? "color: red;" : "")
                html += `<p style="${userStyle}">${u.username}: ${u.coherence?.value}</p>`
            })

            document.getElementById(`${this.props.id}-coherence`).innerHTML = html
        }

        return {HTMLtemplate, setupHTML ,responses, shared}
    }

    deinit = () => {}
}