import * as Plotly from 'plotly.js-dist'

class Plot{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            speed: {default: 3, min: 0, max:10, step: 0.01}
        }

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
        }

        // Port Definition
        this.ports = {
            default: {}
        }
    }

    init = () => {


        let display = ("show" in this.states) ? 'none' : 'flex'

        let HTMLtemplate = () => {
            return `
            <div id='${this.props.id}' style='display: ${display}; align-items: center; justify-content: center; width: 100%; height: 100%;'>
            </div>`
        }

        let setupHTML = () => {

            // Canvas Stuff
            this.props.container = document.getElementById(`${this.props.id}`)
            Plotly.newPlot( this.props.container, [{
            x: [1, 2, 3, 4, 5],
            y: [1, 2, 4, 8, 16] }], {
            margin: { t: 0 } } );

            this.responsive()

            // Animation Loop
            let animate = () => {
                setTimeout(animate, 1000/60) // 60 Loops/Second
            }
            animate()
     

        }

        return {HTMLtemplate, setupHTML}
    }

    responsive = () => {
       
    }

    show = (userData) => {
        let show = userData[0].data
        if (show) this.props.container.style.display = 'flex'
        this.responsive()
        return [{data: true, meta: {label: `${this.label}_show`, params: {mode: 'Manual', trialProgression: null, trialTypes: ['Blink Left', 'Blink Right', 'Blink Both']}}}]
    }

    default = (userData) => {
        return userData
    }

    deinit = () => {}
}

export {Plot}