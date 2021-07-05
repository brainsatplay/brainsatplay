import {Blink} from '../algorithms/Blink'
import {MotorImagery} from '..//algorithms/MotorImagery'
import {createCards} from '../../ui/browserUtils';

export class Train{

    static id = String(Math.floor(Math.random()*1000000))
    
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

        this.props.gameOverlay = document.createElement('div')
        this.props.gameOverlay.classList.add('training-overlay')
        this.props.gameOverlay.style.padding = 0
        document.body.insertAdjacentElement('beforeend', this.props.gameOverlay)

        // Get Compatible Models and Games
        let modelTypes = info.class.models
        let eventTargets = info.class.targets

        this.props.trainingOverlay.insertAdjacentHTML('beforeend', `<h1>${this.params.mode}</h1>`)  

        // Display Models
        if (modelTypes.length > 1){
            let modelContainer = document.createElement('div')
            this.props.trainingOverlay.insertAdjacentElement('beforeend', modelContainer)
            modelContainer.insertAdjacentHTML('beforebegin', '<h2>Choose your Model</h2><hr>')
            modelTypes.forEach(model => {
                let name = model.name[0].toUpperCase() + model.name.slice(1)
                modelContainer.insertAdjacentHTML('beforeend', `<button class="brainsatplay-default-button">${name}</button>`)
            })
        } else {
            // Select only model to train
        }

        // Display Games
        let gameContainer = document.createElement('div')
        this.props.trainingOverlay.insertAdjacentElement('beforeend', gameContainer)
        gameContainer.classList.add('training-game-container')
        gameContainer.insertAdjacentHTML('beforebegin', '<h2>Choose your Training Game</h2><hr>')

        // Find Applets for Training
        let appletFilter = (settings) => {

            let foundBinding;
            if (settings.graph){
                settings.graph.nodes.forEach(n => {
                    if (n.class.name === 'Event') foundBinding = true
                })
            }
            if (foundBinding && settings.canTrain) return settings
        }

        let applets = createCards(this.params.applets, appletFilter)

        let selectedSettings
        applets.forEach(o => {
            o.element.onclick = () => {
                o.element.classList.toggle('selected')
                selectedSettings = o.settings
            }
            gameContainer.insertAdjacentElement('beforeend', o.element)
        })


        // Add Buttons
        let buttonDiv = document.createElement('div')
        buttonDiv.classList.add(`training-buttons`)

        let backButton = document.createElement('button')
        backButton.classList.add(`brainsatplay-default-button`)
        backButton.innerHTML = 'Go Back'
        backButton.onclick = () => {
            this.props.trainingOverlay.classList.toggle('shown')
        }

        let continueToggle = document.createElement('button')
        continueToggle.classList.add(`brainsatplay-default-button`)
        continueToggle.innerHTML = 'Start Training'
        continueToggle.onclick = () => {
            this.props.trainingGame = this.session.initApp(selectedSettings, this.props.gameOverlay,this.session)
            this.props.trainingGame.init()
            this.props.gameOverlay.classList.toggle('shown')

            // Stop Training
            setTimeout(() => {
                this.props.trainingGame.deinit()
                this.props.gameOverlay.classList.toggle('shown')
            }, 5000)
        }

        buttonDiv.insertAdjacentElement('beforeend', backButton)
        buttonDiv.insertAdjacentElement('beforeend', continueToggle)
        this.props.trainingOverlay.insertAdjacentElement('beforeend', buttonDiv)

        // Show Directions
        
        return this.props.trainingOverlay
    }
}