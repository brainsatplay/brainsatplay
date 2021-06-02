
import { StateManager } from './ui/StateManager'
import { DOMFragment } from './ui/DOMFragment';

export class EventRouter{
    constructor(){
        this.device = null
        this.state = new StateManager()
        this.routes = {}

        this.id = String(Math.floor(Math.random()*1000000))
        this.atlasEvents = ['switches']
    }

    init(device){
        this.device = device
        if (this.device.states){
        Object.keys(this.device.states).forEach(key => {
                let states = this.device.states[key]
                if (states != null){
                    if (!Array.isArray(states)) states = [states]
                    states.forEach((state,i) => {

                        // Add to Event State
                        this.state.addToState(state.meta.label, state)
                        this.routes[state.meta.label] = [state]

                        // Update Data in Atlas if Included
                        if (this.atlasEvents.includes(state.meta.label)){                            
                            this.device.atlas.data.states[str].push(state)
                        }

                        // Declare Callback and Subscribe
                        let deviceCallback = (o) => {this.update(o, this.routes[state.meta.label])}
                        this.state.subscribe(state.meta.label, deviceCallback)
                    })
                }
        })
    }
    }

    deinit = () => {}

    // Route Events to Atlas
    update(o,targets=[]) {
        let newState = o.data

        targets.forEach(t => {
            t.data = newState
        })
    }

    // assign(state,){

    // }


    autoRoute = (stateManagerArray) => {
        let validRoutes = this.getValidRoutes(stateManagerArray)

        for (let event in this.routes){

            let routes = this.routes[event]
            if (((this.atlasEvents.includes(event) && routes.length < 2) || (routes.length == 0)) && validRoutes.length > 0){

                let newRoute = validRoutes.shift()
                let target = newRoute.manager.data[newRoute.key]
                routes.push(target)

                let routeSelector = document.getElementById(`${this.id}brainsatplay-router-selector-${event}`)
                if (routeSelector != null) {
                    var opts = routeSelector.options;
                    for (var opt, j = 0; opt = opts[j]; j++) {
                        if (opt.value == newRoute.key) {
                            routeSelector.selectedIndex = j;
                        break;
                        }
                    }
                }
            }
        }
    }

    getValidRoutes = (stateManagerArray) => {
        let validRoutes = []

        let reservedKeys = ['info','commandResult', 'update']
        stateManagerArray.forEach(manager => {
            let keys = Object.keys(manager.data)
            let regex = new RegExp('device[0-9]+')
            keys = keys.filter(k => !reservedKeys.includes(k) && !regex.test(k))
            keys.forEach((key) => {
                validRoutes.push({key,manager})
            })
        })
        return validRoutes
    }

    addControls = (stateManagerArray, parentNode=document.body) => {
        let template = () => {
            return `
            <br>
            <div id='${this.id}routerControls'>
                <h4>Control Panel</h4>
                <button>Update</button>
                <hr>
                <div class='brainsatplay-router-options' style="display: flex; flex-wrap: wrap;">
                </div>
            </div>
            `;
        }

        let update = () => {
            let routerOptions = document.getElementById(`${this.id}routerControls`).querySelector('.brainsatplay-router-options')
            routerOptions.innerHTML = ''
            
            let validRoutes = this.getValidRoutes(stateManagerArray)

            let managerMap = {}
            let selector = document.createElement('select')
            selector.insertAdjacentHTML('beforeend',`
            <option value="" disabled selected>Choose an event</option>
            <option value="none">None</option>
            `)
            validRoutes.forEach(dict => {
                managerMap[dict.key] = dict.manager
                let upper = dict.key[0].toUpperCase() + dict.key.slice(1)
                selector.insertAdjacentHTML('beforeend',`<option value="${dict.key}">${upper}</option>`)           
            })

            Object.keys(this.state.data).forEach(key => {
                let thisSelector = selector.cloneNode(true)

                thisSelector.id = `${this.id}brainsatplay-router-selector-${key}`

                thisSelector.onchange = (e) => {
                    try {
                        let target = managerMap[thisSelector.value].data[thisSelector.value]
                        if (this.atlasEvents.includes(key)){
                            if (routes.length < 2) this.routes[key].push(target)
                            else this.routes[key][1] = target
                        } else {
                            this.routes[key][0] = target
                        }
                    } catch (e) {}
                }

                let div = document.createElement('div')
                div.insertAdjacentHTML('beforeend', `<h3>${key}</h3>`)
                div.insertAdjacentElement('beforeend', thisSelector)
                routerOptions.insertAdjacentElement('beforeend',div)
            })
            
            this.autoRoute(stateManagerArray)
        }

        let setup = () => {
            let updateButton = document.getElementById(`${this.id}routerControls`).querySelector('button')
           updateButton.onclick = () => {
            update()
           }
            update()
        }

        this.ui = new DOMFragment(
            template,
            parentNode,
            undefined,
            setup
        )
    }
}