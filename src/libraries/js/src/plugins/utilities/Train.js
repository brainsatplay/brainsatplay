import bci from 'bcijs/browser.js'
import {eegmath} from '../../utils/eegmath';
import {Blink} from '../../plugins/algorithms/Blink';
import {MotorImagery} from '../../plugins/algorithms/MotorImagery';

export class Train{

    static id = String(Math.floor(Math.random()*1000000))
    // static hidden = true
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            mode: {
                input: {type: 'string'},
                output: {type: null},
                default: 'Motor Imagery',
                options: ['Motor Imagery', 'Other'],
                onUpdate: (userData) => {
                    this.params.mode = userData[0].data
                }
            },
            ui: {
                input: {type: null},
                output: {type: Object},
                onUpdate: () => {
                    return [{data: this.props.ui}]
                }
            }
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),            
            bci: bci,
            ui: {}
        }
    }

    init = () => {

        this.props.ui.HTMLtemplate = () => {
            return `
            <div class="training-prompt-container">
                <div id='${this.props.id}prompt' class="training-prompt">
                    <div>
                        <h2>${this.params.mode}</h2>
                        <p>Latest Performance: <span id="${this.props.id}performance"></spam></p>
                    </div>
                    <div>
                        <button id='${this.props.id}start' class="brainsatplay-default-button disabled">Train Now</button>
                    </div>
                </div>
            </div>
            `
        }

        this.props.ui.setupHTML = (app) => {
            this.props.performance = document.getElementById(`${this.props.id}performance`);
            this.props.performance.innerHTML = '-'

            this.props.start = document.getElementById(`${this.props.id}start`);
            this.props.start.classList.toggle('disabled')

            // Create Training Overlay
            let trainingInfo = {id: this.props.id, class: null}
            if (this.params.mode === 'Motor Imagery'){
                trainingInfo.class = MotorImagery
            } else {
                trainingInfo.class = Blink
            }
            trainingInfo = this.session.graph.instantiateNode(trainingInfo,this.session)

            this.props.trainingOverlay = this._createTrainingIntro(trainingInfo)

            // Reveal Training Intro
            this.props.start.onclick = () => {
                this.props.trainingOverlay.classList.toggle('shown')
            }
        }

        this.session.graph.runSafe(this,'ui',[{force: true}])
    }

    deinit = () => {
        this.props.trainingOverlay.remove()
    }

    _createTrainingIntro = (info) => {
        // Create Overlay
        this.props.trainingOverlay = document.createElement('div')
        this.props.trainingOverlay.classList.add('training-overlay')
        document.body.insertAdjacentElement('beforeend', this.props.trainingOverlay)

        // Get Compatible Models and Games
        let modelTypes = info.class.models
        let eventTargets = info.class.targets

        let modelContainer = document.createElement('div')
        modelContainer.innerHTML = '<h2>Choose your Model</h2>'
        modelTypes.forEach(model => {
            let name = model.name[0].toUpperCase() + model.name.slice(1)
            modelContainer.insertAdjacentHTML('beforeend', `<button class="brainsatplay-default-button">${name}</button>`)
        })
        this.props.trainingOverlay.insertAdjacentElement('beforeend', modelContainer)

        let gameContainer = document.createElement('div')
        gameContainer.innerHTML = '<h2>Choose your Training Game</h2>'
        eventTargets.forEach(cls => {
            let games = cls.name
            let name = games[0].toUpperCase() + games.slice(1)
            gameContainer.insertAdjacentHTML('beforeend', `<button class="brainsatplay-default-button">${name}</button>`)
        })
        this.props.trainingOverlay.insertAdjacentElement('beforeend', gameContainer)

        let continueToggle = document.createElement('button')
        continueToggle.classList.add(`brainsatplay-default-button`)
        continueToggle.innerHTML = 'Begin Training'
        this.props.trainingOverlay.insertAdjacentElement('beforeend', continueToggle)

        // Show Directions
        
        return this.props.trainingOverlay
    }
}