
import * as displays from './../../../libraries/js/src/plugins/displays'


export class Manager{
    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(info, graph){
        ;
        ;

        this.props = {
            container: document.createElement('div')
        }

        this.props.container.style = 'width: 100%; height: 100%;'

        this.ports = {
            default: {
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (user) => {
                    console.log(user)
                }
            },
            element: {
                data: this.props.container,
                input: {type: null},
                output: {type: Element},
            }
        }
    }

    init = () => {


        let drawer = document.createElement('div')
        drawer.style = 'display: flex; padding: 15px 20px; width: 100%; height: 85px; position: absolute; bottom: 0px; left: 0px; background: #111111'

        // Select View
        this._createSelector('View', Object.keys(displays), drawer)

        // Select Analysis
            // TODO: Get analyses from a registry
        let analyses = ['FFT', 'Coherence'] // displays.configure()
        this._createSelector('Analysis', analyses, drawer)

        this.props.container.insertAdjacentElement('beforeend', drawer)
        
    }

    deinit = () => {
        
    }

    _createSelector = (name, options, parentNode) => {
        // Select View
        let select = document.createElement('select')
        select.style = 'max-height: 35px; margin-right: 25px;'

        let div = document.createElement('div')

        let h4 = document.createElement('h5')
        h4.style = 'margin: 0; margin-bottom: 10px;'
        h4.innerHTML = name
        div.insertAdjacentElement('beforeend', h4)
        options.forEach(str => {
            let option = document.createElement('option')
            option.value = option.innerHTML = str
            select.appendChild(option)       
        })

        div.insertAdjacentElement('beforeend', select)        
        parentNode.insertAdjacentElement('beforeend', div)        
    }
}