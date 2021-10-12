import {SSVEP} from '../../../libraries/js/src/utils/signal_processing/ssvep/SSVEP'
import { AnimatedSprite } from 'pixi.js'

class Manager{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session

        this.analysis = ['eegfft']

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


            rate: {
                data: 1,
                min: 0,
                max: 10,
                step: 0.01,
                input: {type: 'number'},
                output: {type: null}
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
        this.props.objects = Array.from({length: this.props.n}, (e,i) => {return {element: null, 
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
                this._checkERP(flashTime)
            }, 500) // after 500 ms


            // Wait until Next Flash
            setTimeout(this._animate, 1000/this.ports.rate.data)
        }
    }

    _checkERP = (time) => {

        let lB = time + 100
        let uB = time + 500
        let uBi, lBi

        this.ports.atlas.data.eeg.forEach(ch => {
            let times = ch.times.reverse()
            for (let i = 0; i < times.length; i++){
                if (times[i] < lB) {
                    lBi = i
                    break 
                } 

                if (times[i] <= uB && uBi == null){
                    uBi = i
                }
            }

            // Grab Slice
            let data = (ch.filtered.length > 0) ? ch.filtered.reverse() : ch.raw.reverse()
            let arr = data.slice(uBi, lBi)
            arr = arr.reverse()
            console.log(ch.tag, arr)
        })

    }
}

export {Manager}