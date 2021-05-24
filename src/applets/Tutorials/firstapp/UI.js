export class UI{
    constructor(session) {
        this.id = 'myfirstapplet'
        this.session = session
        this.props = {
            id: String(Math.floor(Math.random()*1000000))
        }
    }

    init = () => {
        let HTMLtemplate = () => {return `
            <div id='${this.props.id}' style='display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;'>
                <div>
                    <h1>Frontal Alpha Coherence</h1>
                    <p id="${this.props.id}-coherence"></p>
                </div>
            </div>`
        }


        let setupHTML = (app) => {}


        let responses = {
            coherence: (userData) => {
              let html = ``
              userData.forEach(u => {
                  if (u.coherence != undefined){
                  html += `<p>${u.username}: ${u.coherence}</p>`
                  }
              })
              document.getElementById(`${this.props.id}-coherence`).innerHTML = html
          }
        }

        return {HTMLtemplate, setupHTML ,responses}
    }

    deinit = () => {}
}