

import {Plugin} from '../../../libraries/js/src/graph/Plugin'

export class Manager extends Plugin{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, graph) {
        super(info, graph)

        // this.analysis = ['eegfft']

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),      
            rowcolmanager: {
                variables: ['row', 'col'],
                variable: 0,
                gridlength: 0,
                count: 0
            },
            looping: false      
        }


        this.props.container = document.createElement('div')
        this.props.container.id = this.props.id

        this.props.grid = document.createElement('div')
        this.props.grid.style = 'width: min(80vw,80vh); height: min(80vw,80vh); padding: 50px; display:grid;'
        this.props.container.insertAdjacentElement('beforeend',this.props.grid)


        this.props.n = 4
        this.props.objects = []; 
        this.props.freqRange = [4,16]

        // Port Definition
        this.ports = {
            atlas: {
                input: {type: Object, name: 'DataAtlas'},
                output: {type: null}
            }, 

            schedule: {
                input: {type: 'string'},
                output: {type: null},
                onUpdate: (user) => {
                    let labelDiv = document.getElementById(`${this.props.id}-label`)
                    labelDiv.innerHTML = user.meta.state
                    let barDiv = document.getElementById(`${this.props.id}-bar`)
                    let statePercentage = user.meta.stateTimeElapsed / user.meta.stateDuration
                    // Fill a Progress Bar
                    let fillBar = barDiv.querySelector('div')
                    if (user.meta.state === 'ITI') fillBar.style.background = 'red'
                    else fillBar.style.background = '#00FF00'
            
                    if (statePercentage > 1) statePercentage = 1
                    fillBar.style.width = `${statePercentage*100}%`
                }
            },

            mode: {
                data: 'object',
                options: ['object', 'row/col'],
                input: {type: 'string'},
                output: {type: null}
            },

            redundancy: {
                data: 2,
            },


            rate: {
                data: 1,
                min: 0,
                max: 2,
                step: 0.01,
                input: {type: 'number'},
                output: {type: null}
            },

            // INPUT
            select: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: (user) => {

                    let P300 = user.data
                    let objectInd = user.meta.object

                    if (P300) console.log('SELECTED')

                    // If P300, change object color
                    this.props.objects.forEach((o,i) => {
            
                        // Correct Activation
                        if (P300 && objectInd === i) {
                            o.activations++
                            if (o.activations >= this.ports.redundancy.data) {
                                o.element.style.background = 'red'
                                o.activations = 0 // reset activations
                            }
                            else {
                                o.element.style.background = 'white'
                            }
                        }
            
                        // Incorrect Activation
                        else if (P300 && objectInd !== i){
                            o.activations = 0 // reset activations
                            o.element.style.background = 'white'
                        }
            
                        // No Activation
                        else {
                            o.element.style.background = 'white'
                        }
                    })
                }
            },

            // OUTPUT
            timestamp: {
                input: {type: null},
                output: {type: 'number'},
                onUpdate: (user) => {
                    user.meta.object = this.props.selected
                    return user
                }
            },

            element: {
                edit: false,
                input: {type: null},
                output: {type: Element},
                data: this.props.container,
                onUpdate: () => {
                    this.ports.element.data = this.props.container
                    return {data: this.ports.element.data}
                }
            }
        }
    }

    init = () => {

            // Generate Grid of Objects
            this._generateGrid()

            // Start Animation
            this.looping = true
            this._animate()
    }

    deinit = () => {
        this.looping = false
    }

    _generateGrid = () => {
        this.props.rowcolmanager.gridlength = Math.ceil(Math.sqrt(this.props.n))

        // Populate Objects
        this.props.objects = Array.from({length: this.props.n}, (e,i) => {return {
            element: null, 
            activations: 0,
            // f: 1 + (i)*((this.props.SSVEPManager.refreshRate/2)/(this.props.n+2))
            row:(this.props.rowcolmanager.gridlength - 1) -  Math.floor(i / this.props.rowcolmanager.gridlength),
            col: (this.props.rowcolmanager.gridlength - 1) - i % this.props.rowcolmanager.gridlength,
            f: this.props.freqRange[0] + i*(this.props.freqRange[1] - this.props.freqRange[0])/(this.props.n-1)
        }})
        
        // Style Grid
        this.props.grid.style.gridTemplateRows = `repeat(${this.props.rowcolmanager.gridlength},1fr)`
        this.props.grid.style.gridTemplateColumns = `repeat(${this.props.rowcolmanager.gridlength},1fr)`

        let objectStyle = `
            background: white;
            box-sizing: border-box;
            margin: 25%;
            border-radius: 50%;
        `

        // Populate Grid
        this.props.objects.forEach((o,i) => {
            let newElement = document.createElement('div')
            newElement.id = i
            newElement.style = objectStyle
            this.props.grid.appendChild(newElement)
            o.element = newElement
        })

    }

    _animate = () => {


        if (this.looping){
            let variable = this.props.rowcolmanager.variables[this.props.rowcolmanager.variable]

            // Select Objects to Flash
            let i;
            do {
                if (this.ports.mode.data === 'object'){i =  Math.floor(this.props.n * Math.random())}
                else {
                    this.props.rowcolmanager.count++

                    // swap row/col
                    if (this.props.rowcolmanager.count >= this.props.rowcolmanager.gridlength) {
                        this.props.rowcolmanager.count = 0
                        this.props.rowcolmanager.variable++
                        if (this.props.rowcolmanager.variable >= this.props.rowcolmanager.variables.length) this.props.rowcolmanager.variable = 0
                    }
                    i = this.props.rowcolmanager.count
                }
            } while (i === this.props.selected)
            this.props.selected = i
            
            // Flash
            this.props.objects.forEach((o,i) => {
                o.element.style.visibility = 'visible'
                if (this.ports.mode.data === 'object' && i === this.props.selected) o.element.style.visibility = 'hidden'
                if (this.ports.mode.data === 'row/col' && o[variable] === this.props.selected) o.element.style.visibility = 'hidden'
            })

            // Check for P300
            let flashTime = Date.now()
            setTimeout(() => {
                this.update('timestamp', {data: flashTime}) // send timestamp downstream
            }, 500) // after 500 ms


            // Wait until Next Flash
            setTimeout(this._animate, 1000/this.ports.rate.data)
        }
    }
}